package com.bookmyroute.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_seats",
       uniqueConstraints = @UniqueConstraint(name = "uq_booking_seat", columnNames = {"booking_id", "seat_id"}))
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_bs_booking"))
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_bs_seat"))
    private Seat seat;

    @Column(name = "passenger_name", nullable = false, length = 100)
    private String passengerName;

    @Column(name = "passenger_age", nullable = false)
    private Integer passengerAge;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fare;

    @Column(name = "passenger_gender", length = 10)
    private String passengerGender;

    public BookingSeat() {}

    public BookingSeat(Long id, Booking booking, Seat seat, String passengerName,
                       Integer passengerAge, BigDecimal fare, String passengerGender) {
        this.id = id; this.booking = booking; this.seat = seat;
        this.passengerName = passengerName; this.passengerAge = passengerAge; this.fare = fare;
        this.passengerGender = passengerGender;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Booking booking;
        private Seat seat;
        private String passengerName;
        private Integer passengerAge;
        private BigDecimal fare;
        private String passengerGender;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder booking(Booking booking) { this.booking = booking; return this; }
        public Builder seat(Seat seat) { this.seat = seat; return this; }
        public Builder passengerName(String passengerName) { this.passengerName = passengerName; return this; }
        public Builder passengerAge(Integer passengerAge) { this.passengerAge = passengerAge; return this; }
        public Builder fare(BigDecimal fare) { this.fare = fare; return this; }
        public Builder passengerGender(String passengerGender) { this.passengerGender = passengerGender; return this; }

        public BookingSeat build() {
            BookingSeat bs = new BookingSeat();
            bs.id = this.id; bs.booking = this.booking; bs.seat = this.seat;
            bs.passengerName = this.passengerName; bs.passengerAge = this.passengerAge; bs.fare = this.fare;
            bs.passengerGender = this.passengerGender;
            return bs;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public Seat getSeat() { return seat; }
    public void setSeat(Seat seat) { this.seat = seat; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public Integer getPassengerAge() { return passengerAge; }
    public void setPassengerAge(Integer passengerAge) { this.passengerAge = passengerAge; }
    public BigDecimal getFare() { return fare; }
    public void setFare(BigDecimal fare) { this.fare = fare; }
    public String getPassengerGender() { return passengerGender; }
    public void setPassengerGender(String passengerGender) { this.passengerGender = passengerGender; }
}
