package com.bookmyroute.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pickup_locations")
public class PickupLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Route route;

    @Column(nullable = false)
    private String pickupName;

    @Column(nullable = false)
    private String pickupAddress;

    private String landmark;

    @Column(nullable = false)
    private String pickupTime;

    @Column(nullable = false)
    private Integer sequenceOrder;

    @OneToMany(mappedBy = "pickupLocation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PickupSubLocation> subLocations = new ArrayList<>();

    public PickupLocation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

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

    public List<PickupSubLocation> getSubLocations() { return subLocations; }
    public void setSubLocations(List<PickupSubLocation> subLocations) { this.subLocations = subLocations; }

    public void addSubLocation(PickupSubLocation subLocation) {
        subLocations.add(subLocation);
        subLocation.setPickupLocation(this);
    }
}
