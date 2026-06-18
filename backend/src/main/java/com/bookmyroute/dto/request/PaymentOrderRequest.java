package com.bookmyroute.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public class PaymentOrderRequest {

    @NotNull
    private Long scheduleId;

    @NotEmpty
    @Valid
    private List<BookingRequest.PassengerSeat> passengers;

    private Long pickupLocationId;
    private Long dropLocationId;
    private Long pickupSubLocationId;
    private Long dropSubLocationId;

    public PaymentOrderRequest() {}

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
    public List<BookingRequest.PassengerSeat> getPassengers() { return passengers; }
    public void setPassengers(List<BookingRequest.PassengerSeat> passengers) { this.passengers = passengers; }
    public Long getPickupLocationId() { return pickupLocationId; }
    public void setPickupLocationId(Long pickupLocationId) { this.pickupLocationId = pickupLocationId; }
    public Long getDropLocationId() { return dropLocationId; }
    public void setDropLocationId(Long dropLocationId) { this.dropLocationId = dropLocationId; }
    public Long getPickupSubLocationId() { return pickupSubLocationId; }
    public void setPickupSubLocationId(Long pickupSubLocationId) { this.pickupSubLocationId = pickupSubLocationId; }
    public Long getDropSubLocationId() { return dropSubLocationId; }
    public void setDropSubLocationId(Long dropSubLocationId) { this.dropSubLocationId = dropSubLocationId; }
}