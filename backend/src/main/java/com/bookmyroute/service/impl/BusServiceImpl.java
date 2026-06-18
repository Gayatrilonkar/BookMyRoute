package com.bookmyroute.service.impl;

import com.bookmyroute.entity.Bus;
import com.bookmyroute.entity.Seat;
import com.bookmyroute.enums.BusType;
import com.bookmyroute.enums.SeatType;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.BusRepository;
import com.bookmyroute.repository.SeatRepository;
import com.bookmyroute.service.BusService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BusServiceImpl implements BusService {
    public BusServiceImpl(BusRepository busRepository, SeatRepository seatRepository) {
        this.busRepository = busRepository;
        this.seatRepository = seatRepository;
    }


    private final BusRepository busRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional
    public Bus createBus(Bus bus) {
        bus.setTotalSeats(normalizedSeatCount(bus.getBusType(), bus.getTotalSeats()));
        Bus saved = busRepository.save(bus);
        ensureSeatsExist(saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Bus> getAllActiveBuses() {
        return busRepository.findAllByIsActiveTrue();
    }

    @Override
    @Transactional
    public Bus updateBus(Long id, Bus updated) {
        Bus bus = getBusById(id);
        bus.setBusName(updated.getBusName());
        bus.setBusType(updated.getBusType());
        bus.setTotalSeats(normalizedSeatCount(updated.getBusType(), updated.getTotalSeats()));
        bus.setAmenities(updated.getAmenities());
        return busRepository.save(bus);
    }

    @Override
    @Transactional
    public void deactivateBus(Long id) {
        Bus bus = getBusById(id);
        bus.setIsActive(false);
        busRepository.save(bus);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seat> getSeatsByBus(Long busId) {
        return seatRepository.findAllByBusId(busId);
    }

    private void ensureSeatsExist(Bus bus) {
        List<Seat> existingSeats = seatRepository.findAllByBusId(bus.getId());
        int seatCount = normalizedSeatCount(bus.getBusType(), bus.getTotalSeats());
        if (!seatCountEquals(bus.getTotalSeats(), seatCount)) {
            bus.setTotalSeats(seatCount);
            busRepository.save(bus);
        }
        if (existingSeats.size() >= seatCount) {
            return;
        }

        Set<String> existingSeatNumbers = existingSeats.stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.toSet());

        List<Seat> seatsToCreate = new ArrayList<>();

        if (isSleeper(bus.getBusType())) {
            // Sleeper layout: 6 seats per row, split evenly between lower and upper deck
            // Lower deck: NA (left), NB + NC (right pair)
            // Upper deck: ND (left), NE + NF (right pair)
            // e.g. 30 seats → 5 rows → 15 lower + 15 upper
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
            // Standard layout: S1, S2, S3, ... for non-sleeper buses
            for (int i = 1; i <= seatCount; i++) {
                String seatNumber = "S" + i;
                if (!existingSeatNumbers.contains(seatNumber))
                    seatsToCreate.add(Seat.builder().bus(bus).seatNumber(seatNumber).seatType(SeatType.LOWER_LEFT).build());
            }
        }

        if (!seatsToCreate.isEmpty()) {
            seatRepository.saveAll(seatsToCreate);
        }
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
}
