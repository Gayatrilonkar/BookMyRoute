package com.bookmyroute.entity;

import com.bookmyroute.enums.BookingStatus;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@EntityListeners(AuditingEntityListener.class)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_book_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_book_schedule"))
    private Schedule schedule;

    @Column(name = "booking_ref", nullable = false, unique = true, length = 25)
    private String bookingRef;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private BookingStatus status = BookingStatus.PENDING;

    @CreatedDate
    @Column(name = "booked_at", nullable = false, updatable = false)
    private LocalDateTime bookedAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingSeat> bookingSeats = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_location_id")
    private PickupLocation pickupLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_location_id")
    private DropLocation dropLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_sub_location_id")
    private PickupSubLocation pickupSubLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_sub_location_id")
    private DropSubLocation dropSubLocation;

    @Column(name = "pickup_location_name")
    private String pickupLocationName;

    @Column(name = "drop_location_name")
    private String dropLocationName;

    @Column(name = "pickup_sub_location_name")
    private String pickupSubLocationName;

    @Column(name = "drop_sub_location_name")
    private String dropSubLocationName;

    public Booking() {}

    public Booking(Long id, User user, Schedule schedule, String bookingRef, BigDecimal totalAmount,
                   BookingStatus status, LocalDateTime bookedAt, LocalDateTime updatedAt,
                   List<BookingSeat> bookingSeats, Payment payment, PickupLocation pickupLocation, DropLocation dropLocation,
                   PickupSubLocation pickupSubLocation, DropSubLocation dropSubLocation,
                   String pickupLocationName, String dropLocationName,
                   String pickupSubLocationName, String dropSubLocationName) {
        this.id = id; this.user = user; this.schedule = schedule;
        this.bookingRef = bookingRef; this.totalAmount = totalAmount; this.status = status;
        this.bookedAt = bookedAt; this.updatedAt = updatedAt;
        this.bookingSeats = bookingSeats; this.payment = payment;
        this.pickupLocation = pickupLocation; this.dropLocation = dropLocation;
        this.pickupSubLocation = pickupSubLocation; this.dropSubLocation = dropSubLocation;
        this.pickupLocationName = pickupLocationName; this.dropLocationName = dropLocationName;
        this.pickupSubLocationName = pickupSubLocationName; this.dropSubLocationName = dropSubLocationName;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private User user;
        private Schedule schedule;
        private String bookingRef;
        private BigDecimal totalAmount;
        private BookingStatus status = BookingStatus.PENDING;
        private LocalDateTime bookedAt;
        private LocalDateTime updatedAt;
        private List<BookingSeat> bookingSeats = new ArrayList<>();
        private Payment payment;
        private PickupLocation pickupLocation;
        private DropLocation dropLocation;
        private PickupSubLocation pickupSubLocation;
        private DropSubLocation dropSubLocation;
        private String pickupLocationName;
        private String dropLocationName;
        private String pickupSubLocationName;
        private String dropSubLocationName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder schedule(Schedule schedule) { this.schedule = schedule; return this; }
        public Builder bookingRef(String bookingRef) { this.bookingRef = bookingRef; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder status(BookingStatus status) { this.status = status; return this; }
        public Builder bookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder bookingSeats(List<BookingSeat> bookingSeats) { this.bookingSeats = bookingSeats; return this; }
        public Builder payment(Payment payment) { this.payment = payment; return this; }
        public Builder pickupLocation(PickupLocation pickupLocation) { this.pickupLocation = pickupLocation; return this; }
        public Builder dropLocation(DropLocation dropLocation) { this.dropLocation = dropLocation; return this; }
        public Builder pickupSubLocation(PickupSubLocation pickupSubLocation) { this.pickupSubLocation = pickupSubLocation; return this; }
        public Builder dropSubLocation(DropSubLocation dropSubLocation) { this.dropSubLocation = dropSubLocation; return this; }
        public Builder pickupLocationName(String pickupLocationName) { this.pickupLocationName = pickupLocationName; return this; }
        public Builder dropLocationName(String dropLocationName) { this.dropLocationName = dropLocationName; return this; }
        public Builder pickupSubLocationName(String pickupSubLocationName) { this.pickupSubLocationName = pickupSubLocationName; return this; }
        public Builder dropSubLocationName(String dropSubLocationName) { this.dropSubLocationName = dropSubLocationName; return this; }

        public Booking build() {
            Booking b = new Booking();
            b.id = this.id; b.user = this.user; b.schedule = this.schedule;
            b.bookingRef = this.bookingRef; b.totalAmount = this.totalAmount; b.status = this.status;
            b.bookedAt = this.bookedAt; b.updatedAt = this.updatedAt;
            b.bookingSeats = this.bookingSeats; b.payment = this.payment;
            b.pickupLocation = this.pickupLocation; b.dropLocation = this.dropLocation;
            b.pickupSubLocation = this.pickupSubLocation; b.dropSubLocation = this.dropSubLocation;
            b.pickupLocationName = this.pickupLocationName; b.dropLocationName = this.dropLocationName;
            b.pickupSubLocationName = this.pickupSubLocationName; b.dropSubLocationName = this.dropSubLocationName;
            return b;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }
    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<BookingSeat> getBookingSeats() { return bookingSeats; }
    public void setBookingSeats(List<BookingSeat> bookingSeats) { this.bookingSeats = bookingSeats; }
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public PickupLocation getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(PickupLocation pickupLocation) { this.pickupLocation = pickupLocation; }
    public DropLocation getDropLocation() { return dropLocation; }
    public void setDropLocation(DropLocation dropLocation) { this.dropLocation = dropLocation; }
    public PickupSubLocation getPickupSubLocation() { return pickupSubLocation; }
    public void setPickupSubLocation(PickupSubLocation pickupSubLocation) { this.pickupSubLocation = pickupSubLocation; }
    public DropSubLocation getDropSubLocation() { return dropSubLocation; }
    public void setDropSubLocation(DropSubLocation dropSubLocation) { this.dropSubLocation = dropSubLocation; }
    public String getPickupLocationName() { return pickupLocationName; }
    public void setPickupLocationName(String pickupLocationName) { this.pickupLocationName = pickupLocationName; }
    public String getDropLocationName() { return dropLocationName; }
    public void setDropLocationName(String dropLocationName) { this.dropLocationName = dropLocationName; }
    public String getPickupSubLocationName() { return pickupSubLocationName; }
    public void setPickupSubLocationName(String pickupSubLocationName) { this.pickupSubLocationName = pickupSubLocationName; }
    public String getDropSubLocationName() { return dropSubLocationName; }
    public void setDropSubLocationName(String dropSubLocationName) { this.dropSubLocationName = dropSubLocationName; }
}
