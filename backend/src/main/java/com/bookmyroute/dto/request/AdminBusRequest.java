package com.bookmyroute.dto.request;

import com.bookmyroute.enums.BusType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminBusRequest {

    @NotBlank(message = "Bus number is required")
    @Size(max = 20, message = "Bus number cannot exceed 20 characters")
    private String busNumber;

    @NotBlank(message = "Bus name is required")
    @Size(max = 100, message = "Bus name cannot exceed 100 characters")
    private String busName;

    @NotNull(message = "Bus type is required")
    private BusType busType;

    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Total seats must be at least 1")
    private Integer totalSeats;

    private String amenities;

    private Boolean isActive = true;

    public AdminBusRequest() {}

    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

    public String getBusName() { return busName; }
    public void setBusName(String busName) { this.busName = busName; }

    public BusType getBusType() { return busType; }
    public void setBusType(BusType busType) { this.busType = busType; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
