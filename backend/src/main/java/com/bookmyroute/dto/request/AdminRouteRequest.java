package com.bookmyroute.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class AdminRouteRequest {

    @NotBlank
    @Size(max = 100)
    private String origin;

    @NotBlank
    @Size(max = 100)
    private String destination;

    @NotNull
    @Min(1)
    private Integer distanceKm;

    @NotNull
    @Min(1)
    private Integer durationMins;

    private List<PickupLocationRequest> pickupLocations = new ArrayList<>();
    private List<DropLocationRequest> dropLocations = new ArrayList<>();

    private Boolean isActive;

    public AdminRouteRequest() {}

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public Integer getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Integer distanceKm) { this.distanceKm = distanceKm; }
    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }
    public List<PickupLocationRequest> getPickupLocations() { return pickupLocations; }
    public void setPickupLocations(List<PickupLocationRequest> pickupLocations) { this.pickupLocations = pickupLocations; }
    public List<DropLocationRequest> getDropLocations() { return dropLocations; }
    public void setDropLocations(List<DropLocationRequest> dropLocations) { this.dropLocations = dropLocations; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public static class PickupLocationRequest {
        @NotBlank
        private String pickupName;
        @NotBlank
        private String pickupAddress;
        private String landmark;
        @NotBlank
        private String pickupTime;
        @NotNull
        private Integer sequenceOrder;
        private List<SubLocationRequest> subLocations = new ArrayList<>();

        public PickupLocationRequest() {}
        public String getPickupName() { return pickupName; }
        public void setPickupName(String pickupName) { this.pickupName = pickupName; }
        public String getPickupAddress() { return pickupAddress; }
        public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }
        public String getPickupTime() { return pickupTime; }
        public void setPickupTime(String pickupTime) { this.pickupTime = pickupTime; }
        public Integer getSequenceOrder() { return sequenceOrder; }
        public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
        public List<SubLocationRequest> getSubLocations() { return subLocations; }
        public void setSubLocations(List<SubLocationRequest> subLocations) { this.subLocations = subLocations; }
    }

    public static class DropLocationRequest {
        @NotBlank
        private String dropName;
        @NotBlank
        private String dropAddress;
        private String landmark;
        @NotBlank
        private String dropTime;
        @NotNull
        private Integer sequenceOrder;
        private List<SubLocationRequest> subLocations = new ArrayList<>();

        public DropLocationRequest() {}
        public String getDropName() { return dropName; }
        public void setDropName(String dropName) { this.dropName = dropName; }
        public String getDropAddress() { return dropAddress; }
        public void setDropAddress(String dropAddress) { this.dropAddress = dropAddress; }
        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }
        public String getDropTime() { return dropTime; }
        public void setDropTime(String dropTime) { this.dropTime = dropTime; }
        public Integer getSequenceOrder() { return sequenceOrder; }
        public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
        public List<SubLocationRequest> getSubLocations() { return subLocations; }
        public void setSubLocations(List<SubLocationRequest> subLocations) { this.subLocations = subLocations; }
    }

    public static class SubLocationRequest {
        @NotBlank
        private String subLocationName;

        @NotNull
        private Integer sequenceOrder;

        public SubLocationRequest() {}
        public String getSubLocationName() { return subLocationName; }
        public void setSubLocationName(String subLocationName) { this.subLocationName = subLocationName; }
        public Integer getSequenceOrder() { return sequenceOrder; }
        public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    }
}
