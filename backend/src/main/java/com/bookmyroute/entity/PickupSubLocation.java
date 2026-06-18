package com.bookmyroute.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "pickup_sub_locations")
public class PickupSubLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_location_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private PickupLocation pickupLocation;

    @Column(nullable = false)
    private String subLocationName;

    @Column(nullable = false)
    private Integer sequenceOrder = 1;

    public PickupSubLocation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PickupLocation getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(PickupLocation pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getSubLocationName() { return subLocationName; }
    public void setSubLocationName(String subLocationName) { this.subLocationName = subLocationName; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
}
