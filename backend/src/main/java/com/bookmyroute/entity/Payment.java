package com.bookmyroute.entity;

import com.bookmyroute.enums.PaymentMethod;
import com.bookmyroute.enums.PaymentStatus;
import jakarta.persistence.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_pay_booking"))
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = true, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "refund_status", length = 50)
    private String refundStatus;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Payment() {
    }

    public Payment(Long paymentId, Booking booking, PaymentMethod paymentMethod, String transactionId,
            String razorpayOrderId, String userEmail, String refundStatus,
            BigDecimal amount, PaymentStatus status, LocalDateTime paidAt) {
        this.id = paymentId;
        this.booking = booking;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.razorpayOrderId = razorpayOrderId;
        this.userEmail = userEmail;
        this.refundStatus = refundStatus;
        this.amount = amount;
        this.status = status;
        this.paidAt = paidAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long paymentId;
        private Booking booking;
        private PaymentMethod paymentMethod;
        private String transactionId;
        private String razorpayOrderId;
        private String userEmail;
        private String refundStatus;
        private BigDecimal amount;
        private PaymentStatus status;
        private LocalDateTime paidAt;

        public Builder paymentId(Long paymentId) {
            this.paymentId = paymentId;
            return this;
        }

        public Builder booking(Booking booking) {
            this.booking = booking;
            return this;
        }

        public Builder paymentMethod(PaymentMethod paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public Builder transactionId(String transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public Builder razorpayOrderId(String razorpayOrderId) {
            this.razorpayOrderId = razorpayOrderId;
            return this;
        }

        public Builder userEmail(String userEmail) {
            this.userEmail = userEmail;
            return this;
        }

        public Builder refundStatus(String refundStatus) {
            this.refundStatus = refundStatus;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder status(PaymentStatus status) {
            this.status = status;
            return this;
        }

        public Builder paidAt(LocalDateTime paidAt) {
            this.paidAt = paidAt;
            return this;
        }

        public Payment build() {
            return new Payment(paymentId, booking, paymentMethod, transactionId, razorpayOrderId, userEmail,
                    refundStatus, amount, status, paidAt);
        }
    }

    public Long getPaymentId() {
        return id;
    }

    public void setPaymentId(Long paymentId) {
        this.id = paymentId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
