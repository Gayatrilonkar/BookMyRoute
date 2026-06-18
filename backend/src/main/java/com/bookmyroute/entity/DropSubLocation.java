package com.bookmyroute.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "drop_sub_locations")
public class DropSubLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_location_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DropLocation dropLocation;

    @Column(nullable = false)
    private String subLocationName;

    @Column(nullable = false)
    private Integer sequenceOrder = 1;

    public DropSubLocation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DropLocation getDropLocation() { return dropLocation; }
    public void setDropLocation(DropLocation dropLocation) { this.dropLocation = dropLocation; }

    public String getSubLocationName() { return subLocationName; }
    public void setSubLocationName(String subLocationName) { this.subLocationName = subLocationName; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
}
