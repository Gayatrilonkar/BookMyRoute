package com.bookmyroute.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminScheduleRequest {

    @NotNull
    private Long busId;

    @NotNull
    private Long routeId;

    @NotNull
    private LocalDateTime departureTime;

    @NotNull
    private LocalDateTime arrivalTime;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal baseFare;

    @NotNull
    @Min(0)
    private Integer availableSeats;

    private Boolean isActive = true;

    private String recurrenceType; // NONE, DAILY, WEEKLY

    private java.time.LocalDate recurrenceEndDate;

    public AdminScheduleRequest() {}

    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }
    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public BigDecimal getBaseFare() { return baseFare; }
    public void setBaseFare(BigDecimal baseFare) { this.baseFare = baseFare; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(String recurrenceType) { this.recurrenceType = recurrenceType; }
    public java.time.LocalDate getRecurrenceEndDate() { return recurrenceEndDate; }
    public void setRecurrenceEndDate(java.time.LocalDate recurrenceEndDate) { this.recurrenceEndDate = recurrenceEndDate; }
}
