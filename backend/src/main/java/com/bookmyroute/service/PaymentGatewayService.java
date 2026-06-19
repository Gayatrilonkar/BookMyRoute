package com.bookmyroute.service;

import com.bookmyroute.dto.request.PaymentOrderRequest;
import com.bookmyroute.dto.request.PaymentVerifyRequest;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.dto.response.PaymentOrderResponse;

public interface PaymentGatewayService {

    /**
     * Creates a Razorpay order and returns the order details needed by the
     * frontend Razorpay checkout widget.
     */
    PaymentOrderResponse createOrder(PaymentOrderRequest request, String userEmail);

    /**
     * Verifies the Razorpay payment signature. If valid, confirms the booking
     * and records the payment transaction id.
     */
    BookingResponse verifyAndConfirm(PaymentVerifyRequest request, String userEmail);

    /**
     * Processes a refund via Razorpay
     */
    void processRefund(com.bookmyroute.entity.Payment payment, java.math.BigDecimal refundAmount);
}