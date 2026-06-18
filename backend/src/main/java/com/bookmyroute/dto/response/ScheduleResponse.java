package com.bookmyroute.dto.response;

import com.bookmyroute.enums.BusType;
import com.bookmyroute.enums.SeatType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ScheduleResponse {

    public static class Search {
        private Long scheduleId;
        private Long routeId;
        private String origin;
        private String destination;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private BigDecimal baseFare;
        private int availableSeats;
        private String busName;
        private BusType busType;
        private String amenities;
        private int durationMins;
        private double routeAverageRating;
        private long routeReviewCount;

        public Search() {}

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long scheduleId;
            private Long routeId;
            private String origin;
            private String destination;
            private LocalDateTime departureTime;
            private LocalDateTime arrivalTime;
            private BigDecimal baseFare;
            private int availableSeats;
            private String busName;
            private BusType busType;
            private String amenities;
            private int durationMins;
            private double routeAverageRating;
            private long routeReviewCount;

            public Builder scheduleId(Long scheduleId) { this.scheduleId = scheduleId; return this; }
            public Builder routeId(Long routeId) { this.routeId = routeId; return this; }
            public Builder origin(String origin) { this.origin = origin; return this; }
            public Builder destination(String destination) { this.destination = destination; return this; }
            public Builder departureTime(LocalDateTime departureTime) { this.departureTime = departureTime; return this; }
            public Builder arrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; return this; }
            public Builder baseFare(BigDecimal baseFare) { this.baseFare = baseFare; return this; }
            public Builder availableSeats(int availableSeats) { this.availableSeats = availableSeats; return this; }
            public Builder busName(String busName) { this.busName = busName; return this; }
            public Builder busType(BusType busType) { this.busType = busType; return this; }
            public Builder amenities(String amenities) { this.amenities = amenities; return this; }
            public Builder durationMins(int durationMins) { this.durationMins = durationMins; return this; }
            public Builder routeAverageRating(double routeAverageRating) { this.routeAverageRating = routeAverageRating; return this; }
            public Builder routeReviewCount(long routeReviewCount) { this.routeReviewCount = routeReviewCount; return this; }

            public Search build() {
                Search s = new Search();
                s.scheduleId = this.scheduleId; s.routeId = this.routeId;
                s.origin = this.origin; s.destination = this.destination;
                s.departureTime = this.departureTime; s.arrivalTime = this.arrivalTime;
                s.baseFare = this.baseFare; s.availableSeats = this.availableSeats;
                s.busName = this.busName; s.busType = this.busType;
                s.amenities = this.amenities; s.durationMins = this.durationMins;
                s.routeAverageRating = this.routeAverageRating; s.routeReviewCount = this.routeReviewCount;
                return s;
            }
        }

        public Long getScheduleId() { return scheduleId; }
        public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
        public Long getRouteId() { return routeId; }
        public void setRouteId(Long routeId) { this.routeId = routeId; }
        public String getOrigin() { return origin; }
        public void setOrigin(String origin) { this.origin = origin; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public LocalDateTime getDepartureTime() { return departureTime; }
        public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
        public LocalDateTime getArrivalTime() { return arrivalTime; }
        public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
        public BigDecimal getBaseFare() { return baseFare; }
        public void setBaseFare(BigDecimal baseFare) { this.baseFare = baseFare; }
        public int getAvailableSeats() { return availableSeats; }
        public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }
        public String getBusName() { return busName; }
        public void setBusName(String busName) { this.busName = busName; }
        public BusType getBusType() { return busType; }
        public void setBusType(BusType busType) { this.busType = busType; }
        public String getAmenities() { return amenities; }
        public void setAmenities(String amenities) { this.amenities = amenities; }
        public int getDurationMins() { return durationMins; }
        public void setDurationMins(int durationMins) { this.durationMins = durationMins; }
        public double getRouteAverageRating() { return routeAverageRating; }
        public void setRouteAverageRating(double routeAverageRating) { this.routeAverageRating = routeAverageRating; }
        public long getRouteReviewCount() { return routeReviewCount; }
        public void setRouteReviewCount(long routeReviewCount) { this.routeReviewCount = routeReviewCount; }
    }

    public static class SeatInfo {
        private Long seatId;
        private String seatNumber;
        private SeatType seatType;
        private String status;
        private BigDecimal fare;
        private String gender;

        public SeatInfo() {}

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private Long seatId;
            private String seatNumber;
            private SeatType seatType;
            private String status;
            private BigDecimal fare;
            private String gender;

            public Builder seatId(Long seatId) { this.seatId = seatId; return this; }
            public Builder seatNumber(String seatNumber) { this.seatNumber = seatNumber; return this; }
            public Builder seatType(SeatType seatType) { this.seatType = seatType; return this; }
            public Builder status(String status) { this.status = status; return this; }
            public Builder fare(BigDecimal fare) { this.fare = fare; return this; }
            public Builder gender(String gender) { this.gender = gender; return this; }

            public SeatInfo build() {
                SeatInfo si = new SeatInfo();
                si.seatId = this.seatId; si.seatNumber = this.seatNumber; si.seatType = this.seatType;
                si.status = this.status; si.fare = this.fare; si.gender = this.gender;
                return si;
            }
        }

        public Long getSeatId() { return seatId; }
        public void setSeatId(Long seatId) { this.seatId = seatId; }
        public String getSeatNumber() { return seatNumber; }
        public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
        public SeatType getSeatType() { return seatType; }
        public void setSeatType(SeatType seatType) { this.seatType = seatType; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getFare() { return fare; }
        public void setFare(BigDecimal fare) { this.fare = fare; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
    }
}
