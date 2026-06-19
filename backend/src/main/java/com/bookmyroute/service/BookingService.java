package com.bookmyroute.service;

import com.bookmyroute.dto.request.BookingRequest;
import com.bookmyroute.dto.request.BookingSearchRequest;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.dto.response.PagedResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String userEmail);
    BookingResponse getBookingByRef(String bookingRef, String userEmail);
    List<BookingResponse> getMyBookings(String userEmail);
    PagedResponse<BookingResponse> searchMyBookings(BookingSearchRequest request, String userEmail);
    com.bookmyroute.dto.response.CancellationQuoteResponse getCancellationQuote(String bookingRef, String userEmail);
    BookingResponse cancelBooking(String bookingRef, String userEmail);
    List<BookingResponse> getAllBookings();   // admin
}
