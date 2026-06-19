package com.bookmyroute.service.impl;

import com.bookmyroute.dto.request.ScheduleSearchRequest;
import com.bookmyroute.dto.response.ScheduleResponse;
import com.bookmyroute.entity.Bus;
import com.bookmyroute.entity.Schedule;
import com.bookmyroute.entity.Seat;
import com.bookmyroute.enums.BusType;
import com.bookmyroute.enums.SeatType;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.ScheduleRepository;
import com.bookmyroute.repository.RouteReviewRepository;
import com.bookmyroute.repository.SeatRepository;
import com.bookmyroute.repository.BookingSeatRepository;
import com.bookmyroute.service.ScheduleService;
import com.bookmyroute.entity.BookingSeat;
import com.bookmyroute.entity.Route;
import com.bookmyroute.entity.PickupLocation;
import com.bookmyroute.entity.PickupSubLocation;
import com.bookmyroute.entity.DropLocation;
import com.bookmyroute.entity.DropSubLocation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ScheduleServiceImpl implements ScheduleService {
    public ScheduleServiceImpl(ScheduleRepository scheduleRepository,
                               SeatRepository seatRepository,
                               RouteReviewRepository routeReviewRepository,
                               BookingSeatRepository bookingSeatRepository) {
        this.scheduleRepository = scheduleRepository;
        this.seatRepository = seatRepository;
        this.routeReviewRepository = routeReviewRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final RouteReviewRepository routeReviewRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", id));
    }

    @Override
    @Transactional
    public Schedule updateSchedule(Long id, Schedule updated) {
        Schedule schedule = getScheduleById(id);
        schedule.setBus(updated.getBus());
        schedule.setRoute(updated.getRoute());
        schedule.setDepartureTime(updated.getDepartureTime());
        schedule.setArrivalTime(updated.getArrivalTime());
        schedule.setBaseFare(updated.getBaseFare());
        schedule.setAvailableSeats(updated.getAvailableSeats());
        schedule.setIsActive(updated.getIsActive());
        return scheduleRepository.save(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse.Search> searchSchedules(ScheduleSearchRequest req) {
        LocalDateTime from = req.getTravelDate().atStartOfDay();
        LocalDateTime to   = req.getTravelDate().atTime(LocalTime.MAX);

        List<Schedule> candidates = scheduleRepository.searchSchedules(
                req.getOrigin(), req.getDestination(), from, to, req.getSeats()
        );

        return candidates.stream()
                .filter(s -> {
                    int oIdx = getStopIndex(s.getRoute(), req.getOrigin());
                    int dIdx = getStopIndex(s.getRoute(), req.getDestination());
                    return oIdx != -1 && dIdx != -1 && oIdx <= dIdx;
                })
                .map(s -> toSearchDto(s, req.getOrigin(), req.getDestination()))
                .toList();
    }

    @Override
    @Transactional
    public List<ScheduleResponse.SeatInfo> getAvailableSeats(Long scheduleId) {
        Schedule schedule = getScheduleById(scheduleId);
        ensureSeatsExist(schedule.getBus());
        Long busId = schedule.getBus().getId();
        
        List<Seat> allSeats = seatsForVisibleLayout(schedule.getBus(), seatRepository.findAllByBusId(busId));
        List<BookingSeat> bookedSeats = bookingSeatRepository.findConfirmedBookingSeatsBySchedule(scheduleId);
        
        Map<Long, BookingSeat> bookedSeatMap = bookedSeats.stream()
                .collect(Collectors.toMap(bs -> bs.getSeat().getId(), bs -> bs));
                
        return allSeats.stream().map(seat -> {
            BookingSeat bs = bookedSeatMap.get(seat.getId());
            String status = (bs != null) ? "BOOKED" : "AVAILABLE";
            String gender = (bs != null) ? bs.getPassengerGender() : null;
            
            java.math.BigDecimal price = schedule.getBaseFare();
            
            return ScheduleResponse.SeatInfo.builder()
                    .seatId(seat.getId())
                    .seatNumber(seat.getSeatNumber())
                    .seatType(seat.getSeatType())
                    .status(status)
                    .fare(price)
                    .gender(gender)
                    .build();
        }).toList();
    }

    @Override
    @Transactional
    public void deactivateSchedule(Long id) {
        Schedule s = getScheduleById(id);
        s.setIsActive(false);
        scheduleRepository.save(s);
    }

    @Override
    public SseEmitter subscribeToSeats(Long scheduleId) {
        SseEmitter emitter = new SseEmitter(600000L); // 10 minutes timeout
        emitters.computeIfAbsent(scheduleId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> emitters.get(scheduleId).remove(emitter));
        emitter.onTimeout(() -> emitters.get(scheduleId).remove(emitter));
        emitter.onError(e -> emitters.get(scheduleId).remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("seats").data(getAvailableSeats(scheduleId)));
        } catch (Exception e) {
            emitters.get(scheduleId).remove(emitter);
        }

        return emitter;
    }

    @Override
    public void broadcastSeatUpdates(Long scheduleId) {
        List<SseEmitter> scheduleEmitters = emitters.get(scheduleId);
        if (scheduleEmitters != null && !scheduleEmitters.isEmpty()) {
            List<ScheduleResponse.SeatInfo> seats = getAvailableSeats(scheduleId);
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : scheduleEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("seats").data(seats));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            scheduleEmitters.removeAll(deadEmitters);
        }
    }

    private ScheduleResponse.Search toSearchDto(Schedule s, String originSearch, String destSearch) {
        Long routeId = s.getRoute().getId();
        long reviewCount = routeReviewRepository.countByRouteId(routeId);
        double averageRating = reviewCount == 0
                ? 0.0
                : Math.round(routeReviewRepository.getAverageRatingByRouteId(routeId) * 10.0) / 10.0;

        return ScheduleResponse.Search.builder()
                .scheduleId(s.getId())
                .routeId(routeId)
                .origin(originSearch)
                .destination(destSearch)
                .departureTime(s.getDepartureTime())
                .arrivalTime(s.getArrivalTime())
                .baseFare(s.getBaseFare())
                .availableSeats(s.getAvailableSeats())
                .busName(s.getBus().getBusName())
                .busType(s.getBus().getBusType())
                .amenities(s.getBus().getAmenities())
                .durationMins(s.getRoute().getDurationMins())
                .routeAverageRating(averageRating)
                .routeReviewCount(reviewCount)
                .build();
    }

    private ScheduleResponse.SeatInfo toSeatInfo(Seat seat) {
        return ScheduleResponse.SeatInfo.builder()
                .seatId(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .seatType(seat.getSeatType())
                .status("AVAILABLE")
                .build();
    }

    private void ensureSeatsExist(Bus bus) {
        List<Seat> existingSeats = seatRepository.findAllByBusId(bus.getId());
        int seatCount = normalizedSeatCount(bus.getBusType(), bus.getTotalSeats());
        if (!seatCountEquals(bus.getTotalSeats(), seatCount)) {
            bus.setTotalSeats(seatCount);
        }

        // If bus is now sleeper, delete any old non-sleeper format seats (S1, S2...)
        // that have no booking records (to avoid FK constraint violations)
        if (isSleeper(bus.getBusType())) {
            List<Seat> nonSleeperSeats = existingSeats.stream()
                    .filter(s -> s.getSeatNumber() != null && !s.getSeatNumber().matches("\\d+[A-F]"))
                    .toList();
            if (!nonSleeperSeats.isEmpty()) {
                List<Seat> safeToDelete = nonSleeperSeats.stream()
                        .filter(s -> !bookingSeatRepository.existsBySeatId(s.getId()))
                        .toList();
                if (!safeToDelete.isEmpty()) {
                    seatRepository.deleteAll(safeToDelete);
                    seatRepository.flush();
                }
                existingSeats = seatRepository.findAllByBusId(bus.getId());
            }
        }

        if (seatsForVisibleLayout(bus, existingSeats).size() >= seatCount) {
            return;
        }

        Set<String> existingSeatNumbers = existingSeats.stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.toSet());

        List<Seat> seatsToCreate = new ArrayList<>();

        if (isSleeper(bus.getBusType())) {
            int rows = seatCount / 6;
            for (int row = 1; row <= rows; row++) {
                String lowerLeft   = row + "A";
                String lowerRight1 = row + "B";
                String lowerRight2 = row + "C";
                String upperLeft   = row + "D";
                String upperRight1 = row + "E";
                String upperRight2 = row + "F";
                if (!existingSeatNumbers.contains(lowerLeft))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(lowerLeft).seatType(SeatType.LOWER_LEFT).build());
                if (!existingSeatNumbers.contains(lowerRight1))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(lowerRight1).seatType(SeatType.LOWER_RIGHT).build());
                if (!existingSeatNumbers.contains(lowerRight2))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(lowerRight2).seatType(SeatType.LOWER_RIGHT).build());
                if (!existingSeatNumbers.contains(upperLeft))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(upperLeft).seatType(SeatType.UPPER_LEFT).build());
                if (!existingSeatNumbers.contains(upperRight1))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(upperRight1).seatType(SeatType.UPPER_RIGHT).build());
                if (!existingSeatNumbers.contains(upperRight2))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(upperRight2).seatType(SeatType.UPPER_RIGHT).build());
            }
        } else {
            for (int i = 1; i <= seatCount; i++) {
                String seatNumber = "S" + i;
                if (!existingSeatNumbers.contains(seatNumber))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(seatNumber).seatType(SeatType.LOWER_LEFT).build());
            }
        }

        if (!seatsToCreate.isEmpty()) {
            seatRepository.saveAll(seatsToCreate);
            seatRepository.flush();
        }
    }

    private List<Seat> seatsForVisibleLayout(Bus bus, List<Seat> seats) {
        int seatCount = normalizedSeatCount(bus.getBusType(), bus.getTotalSeats());
        if (!isSleeper(bus.getBusType())) {
            return seats.stream()
                    .sorted(Comparator.comparingInt(this::standardSeatNumber))
                    .limit(seatCount)
                    .toList();
        }

        int rows = seatCount / 6;
        return seats.stream()
                .filter(seat -> isVisibleSleeperSeat(seat.getSeatNumber(), rows))
                .sorted(this::compareSleeperSeats)
                .toList();
    }

    private boolean isVisibleSleeperSeat(String seatNumber, int rows) {
        if (seatNumber == null || !seatNumber.matches("\\d+[A-F]")) {
            return false;
        }
        int row = Integer.parseInt(seatNumber.substring(0, seatNumber.length() - 1));
        return row >= 1 && row <= rows;
    }

    private int compareSleeperSeats(Seat left, Seat right) {
        int rowCompare = Integer.compare(sleeperRow(left.getSeatNumber()), sleeperRow(right.getSeatNumber()));
        if (rowCompare != 0) {
            return rowCompare;
        }
        return Character.compare(sleeperColumn(left.getSeatNumber()), sleeperColumn(right.getSeatNumber()));
    }

    private int sleeperRow(String seatNumber) {
        return Integer.parseInt(seatNumber.substring(0, seatNumber.length() - 1));
    }

    private char sleeperColumn(String seatNumber) {
        return seatNumber.charAt(seatNumber.length() - 1);
    }

    private int standardSeatNumber(Seat seat) {
        String seatNumber = seat.getSeatNumber();
        if (seatNumber == null || !seatNumber.matches("S\\d+")) {
            return Integer.MAX_VALUE;
        }
        return Integer.parseInt(seatNumber.substring(1));
    }

    private boolean isSleeper(BusType busType) {
        return busType == BusType.AC_SLEEPER || busType == BusType.NON_AC_SLEEPER;
    }

    private int normalizedSeatCount(BusType busType, Integer requestedSeats) {
        int requested = requestedSeats == null ? 0 : requestedSeats;
        if (!isSleeper(busType)) {
            return Math.max(requested, 0);
        }
        return requested <= 30 ? 30 : 36;
    }

    private boolean seatCountEquals(Integer current, int normalized) {
        return current != null && current == normalized;
    }

    private int getStopIndex(Route route, String stopName) {
        if (stopName == null) return -1;
        String query = stopName.toLowerCase().trim();
        if (route.getOrigin() != null && route.getOrigin().toLowerCase().trim().equals(query)) return 0;
        
        int idx = 1;
        if (route.getPickupLocations() != null) {
            for (PickupLocation pl : route.getPickupLocations()) {
                if (pl.getPickupName() != null && pl.getPickupName().toLowerCase().trim().equals(query)) return idx;
                idx++;
                if (pl.getSubLocations() != null) {
                    for (PickupSubLocation psl : pl.getSubLocations()) {
                        if (psl.getSubLocationName() != null && psl.getSubLocationName().toLowerCase().trim().equals(query)) return idx;
                        idx++;
                    }
                }
            }
        }
        
        if (route.getDropLocations() != null) {
            for (DropLocation dl : route.getDropLocations()) {
                if (dl.getDropName() != null && dl.getDropName().toLowerCase().trim().equals(query)) return idx;
                idx++;
                if (dl.getSubLocations() != null) {
                    for (DropSubLocation dsl : dl.getSubLocations()) {
                        if (dsl.getSubLocationName() != null && dsl.getSubLocationName().toLowerCase().trim().equals(query)) return idx;
                        idx++;
                    }
                }
            }
        }
        
        if (route.getDestination() != null && route.getDestination().toLowerCase().trim().equals(query)) return idx;
        
        return -1;
    }
}
