package com.bookmyroute.dto.response;

import com.bookmyroute.entity.PickupLocation;
import com.bookmyroute.entity.DropLocation;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

public class AdminRouteResponse {

    private Long routeId;
    private String origin;
    private String destination;
    private Integer distanceKm;
    private Integer durationMins;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PickupLocation> pickupLocations = new ArrayList<>();
    private List<DropLocation> dropLocations = new ArrayList<>();

    public AdminRouteResponse() {}

    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public Integer getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Integer distanceKm) { this.distanceKm = distanceKm; }
    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }
    public List<PickupLocation> getPickupLocations() { return pickupLocations; }
    public void setPickupLocations(List<PickupLocation> pickupLocations) { this.pickupLocations = pickupLocations; }
    public List<DropLocation> getDropLocations() { return dropLocations; }
    public void setDropLocations(List<DropLocation> dropLocations) { this.dropLocations = dropLocations; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
