package com.bookmyroute.dto.request;

import com.bookmyroute.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public class BookingRequest {

    @NotNull
    private Long scheduleId;

    @NotEmpty
    @Valid
    private List<PassengerSeat> passengers;

    @NotNull
    private PaymentMethod paymentMethod;

    private Long pickupLocationId;
    private Long dropLocationId;
    private Long pickupSubLocationId;
    private Long dropSubLocationId;

    public BookingRequest() {}

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
    public List<PassengerSeat> getPassengers() { return passengers; }
    public void setPassengers(List<PassengerSeat> passengers) { this.passengers = passengers; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public Long getPickupLocationId() { return pickupLocationId; }
    public void setPickupLocationId(Long pickupLocationId) { this.pickupLocationId = pickupLocationId; }
    public Long getDropLocationId() { return dropLocationId; }
    public void setDropLocationId(Long dropLocationId) { this.dropLocationId = dropLocationId; }
    public Long getPickupSubLocationId() { return pickupSubLocationId; }
    public void setPickupSubLocationId(Long pickupSubLocationId) { this.pickupSubLocationId = pickupSubLocationId; }
    public Long getDropSubLocationId() { return dropSubLocationId; }
    public void setDropSubLocationId(Long dropSubLocationId) { this.dropSubLocationId = dropSubLocationId; }

    public static class PassengerSeat {
        @NotNull
        private Long seatId;

        @NotBlank
        @Size(max = 100)
        private String passengerName;

        @NotNull
        @Min(1) @Max(120)
        private Integer passengerAge;

        @NotBlank
        private String passengerGender;

        public PassengerSeat() {}

        public Long getSeatId() { return seatId; }
        public void setSeatId(Long seatId) { this.seatId = seatId; }
        public String getPassengerName() { return passengerName; }
        public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
        public Integer getPassengerAge() { return passengerAge; }
        public void setPassengerAge(Integer passengerAge) { this.passengerAge = passengerAge; }
        public String getPassengerGender() { return passengerGender; }
        public void setPassengerGender(String passengerGender) { this.passengerGender = passengerGender; }
    }
}
