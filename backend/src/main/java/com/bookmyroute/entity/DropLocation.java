package com.bookmyroute.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "drop_locations")
public class DropLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Route route;

    @Column(nullable = false)
    private String dropName;

    @Column(nullable = false)
    private String dropAddress;

    private String landmark;

    @Column(nullable = false)
    private String dropTime;

    @Column(nullable = false)
    private Integer sequenceOrder;

    @OneToMany(mappedBy = "dropLocation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DropSubLocation> subLocations = new ArrayList<>();

    public DropLocation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

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

    public List<DropSubLocation> getSubLocations() { return subLocations; }
    public void setSubLocations(List<DropSubLocation> subLocations) { this.subLocations = subLocations; }

    public void addSubLocation(DropSubLocation subLocation) {
        subLocations.add(subLocation);
        subLocation.setDropLocation(this);
    }
}
