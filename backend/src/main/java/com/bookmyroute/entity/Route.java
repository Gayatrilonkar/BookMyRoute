package com.bookmyroute.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String origin;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(name = "distance_km", nullable = false)
    private Integer distanceKm;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Schedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PickupLocation> pickupLocations = new ArrayList<>();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<DropLocation> dropLocations = new ArrayList<>();

    public Route() {}

    public Route(Long id, String origin, String destination, Integer distanceKm,
                 Integer durationMins, Boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt,
                 List<Schedule> schedules, 
                 List<PickupLocation> pickupLocations, List<DropLocation> dropLocations) {
        this.id = id; this.origin = origin; this.destination = destination;
        this.distanceKm = distanceKm; this.durationMins = durationMins;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.schedules = schedules;
        this.pickupLocations = pickupLocations;
        this.dropLocations = dropLocations;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String origin;
        private String destination;
        private Integer distanceKm;
        private Integer durationMins;
        private Boolean isActive = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<Schedule> schedules = new ArrayList<>();
        private List<PickupLocation> pickupLocations = new ArrayList<>();
        private List<DropLocation> dropLocations = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder origin(String origin) { this.origin = origin; return this; }
        public Builder destination(String destination) { this.destination = destination; return this; }
        public Builder distanceKm(Integer distanceKm) { this.distanceKm = distanceKm; return this; }
        public Builder durationMins(Integer durationMins) { this.durationMins = durationMins; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder schedules(List<Schedule> schedules) { this.schedules = schedules; return this; }
        public Builder pickupLocations(List<PickupLocation> pickupLocations) { this.pickupLocations = pickupLocations; return this; }
        public Builder dropLocations(List<DropLocation> dropLocations) { this.dropLocations = dropLocations; return this; }

        public Route build() {
            Route r = new Route();
            r.id = this.id; r.origin = this.origin; r.destination = this.destination;
            r.distanceKm = this.distanceKm; r.durationMins = this.durationMins;
            r.isActive = this.isActive; r.createdAt = this.createdAt; r.updatedAt = this.updatedAt;
            r.schedules = this.schedules;
            r.pickupLocations = this.pickupLocations;
            r.dropLocations = this.dropLocations;
            return r;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public Integer getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Integer distanceKm) { this.distanceKm = distanceKm; }
    public Integer getDurationMins() { return durationMins; }
    public void setDurationMins(Integer durationMins) { this.durationMins = durationMins; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<Schedule> getSchedules() { return schedules; }
    public void setSchedules(List<Schedule> schedules) { this.schedules = schedules; }
    public List<PickupLocation> getPickupLocations() { return pickupLocations; }
    public void setPickupLocations(List<PickupLocation> pickupLocations) { this.pickupLocations = pickupLocations; }
    public List<DropLocation> getDropLocations() { return dropLocations; }
    public void setDropLocations(List<DropLocation> dropLocations) { this.dropLocations = dropLocations; }

    public void addPickupLocation(PickupLocation pickupLocation) {
        pickupLocations.add(pickupLocation);
        pickupLocation.setRoute(this);
    }

    public void addDropLocation(DropLocation dropLocation) {
        dropLocations.add(dropLocation);
        dropLocation.setRoute(this);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
