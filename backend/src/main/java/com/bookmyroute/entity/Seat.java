package com.bookmyroute.entity;

import com.bookmyroute.enums.SeatType;
import jakarta.persistence.*;

@Entity
@Table(name = "seats",
       uniqueConstraints = @UniqueConstraint(name = "uq_bus_seat", columnNames = {"bus_id", "seat_number"}))
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bus_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_seats_bus"))
    private Bus bus;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 15)
    private SeatType seatType = SeatType.LOWER_LEFT;

    public Seat() {}

    public Seat(Long id, Bus bus, String seatNumber, SeatType seatType) {
        this.id = id; this.bus = bus; this.seatNumber = seatNumber; this.seatType = seatType;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Bus bus;
        private String seatNumber;
        private SeatType seatType = SeatType.LOWER_LEFT;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder bus(Bus bus) { this.bus = bus; return this; }
        public Builder seatNumber(String seatNumber) { this.seatNumber = seatNumber; return this; }
        public Builder seatType(SeatType seatType) { this.seatType = seatType; return this; }

        public Seat build() {
            Seat s = new Seat();
            s.id = this.id; s.bus = this.bus; s.seatNumber = this.seatNumber; s.seatType = this.seatType;
            return s;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public SeatType getSeatType() { return seatType; }
    public void setSeatType(SeatType seatType) { this.seatType = seatType; }
}