package com.bookmyroute.dto.response;

import java.math.BigDecimal;

public class CancellationQuoteResponse {
    private String bookingRef;
    private BigDecimal totalFare;
    private BigDecimal cancellationCharges;
    private BigDecimal refundAmount;
    private String refundPolicy;
    private boolean isRefundable;

    public CancellationQuoteResponse() {}

    public CancellationQuoteResponse(String bookingRef, BigDecimal totalFare, BigDecimal cancellationCharges, BigDecimal refundAmount, String refundPolicy, boolean isRefundable) {
        this.bookingRef = bookingRef;
        this.totalFare = totalFare;
        this.cancellationCharges = cancellationCharges;
        this.refundAmount = refundAmount;
        this.refundPolicy = refundPolicy;
        this.isRefundable = isRefundable;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String bookingRef;
        private BigDecimal totalFare;
        private BigDecimal cancellationCharges;
        private BigDecimal refundAmount;
        private String refundPolicy;
        private boolean isRefundable;

        public Builder bookingRef(String bookingRef) { this.bookingRef = bookingRef; return this; }
        public Builder totalFare(BigDecimal totalFare) { this.totalFare = totalFare; return this; }
        public Builder cancellationCharges(BigDecimal cancellationCharges) { this.cancellationCharges = cancellationCharges; return this; }
        public Builder refundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; return this; }
        public Builder refundPolicy(String refundPolicy) { this.refundPolicy = refundPolicy; return this; }
        public Builder isRefundable(boolean isRefundable) { this.isRefundable = isRefundable; return this; }

        public CancellationQuoteResponse build() {
            return new CancellationQuoteResponse(bookingRef, totalFare, cancellationCharges, refundAmount, refundPolicy, isRefundable);
        }
    }

    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public BigDecimal getTotalFare() { return totalFare; }
    public void setTotalFare(BigDecimal totalFare) { this.totalFare = totalFare; }
    public BigDecimal getCancellationCharges() { return cancellationCharges; }
    public void setCancellationCharges(BigDecimal cancellationCharges) { this.cancellationCharges = cancellationCharges; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
    public String getRefundPolicy() { return refundPolicy; }
    public void setRefundPolicy(String refundPolicy) { this.refundPolicy = refundPolicy; }
    public boolean getIsRefundable() { return isRefundable; }
    public void setIsRefundable(boolean isRefundable) { this.isRefundable = isRefundable; }
}
