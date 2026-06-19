package com.bookmyroute.controller;

import com.bookmyroute.dto.request.BookingRequest;
import com.bookmyroute.dto.request.BookingSearchRequest;
import com.bookmyroute.dto.request.RouteReviewRequest;
import com.bookmyroute.dto.request.RouteReviewUpdateRequest;
import com.bookmyroute.dto.response.ApiResponse;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.dto.response.PagedResponse;
import com.bookmyroute.dto.response.RouteReviewResponse;
import com.bookmyroute.enums.BookingStatus;
import com.bookmyroute.service.BookingPdfService;
import com.bookmyroute.service.BookingService;
import com.bookmyroute.service.RouteReviewService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingPdfService bookingPdfService;
    private final RouteReviewService routeReviewService;

    public BookingController(BookingService bookingService,
                             BookingPdfService bookingPdfService,
                             RouteReviewService routeReviewService) {
        this.bookingService = bookingService;
        this.bookingPdfService = bookingPdfService;
        this.routeReviewService = routeReviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.createBooking(request, userDetails.getUsername());
        String message = Boolean.TRUE.equals(response.getNotificationEmailSent())
                ? "Booking confirmed and confirmation email sent"
                : "Booking confirmed. Confirmation email was not sent: " + response.getNotificationEmailMessage();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, message));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> myBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getMyBookings(userDetails.getUsername())));
    }

    @GetMapping("/my/search")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> searchMyBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingSearchRequest request = new BookingSearchRequest(status, fromDate, toDate, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.searchMyBookings(request, userDetails.getUsername())));
    }

    @GetMapping("/{bookingRef}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable String bookingRef,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getBookingByRef(bookingRef, userDetails.getUsername())));
    }

    @GetMapping("/{bookingRef}/pdf")
    public ResponseEntity<byte[]> downloadTicketPdf(
            @PathVariable String bookingRef,
            @AuthenticationPrincipal UserDetails userDetails) {
        byte[] pdf = bookingPdfService.generateTicketPdf(bookingRef, userDetails.getUsername());
        String filename = "BookMyRoute-" + bookingRef + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(pdf);
    }

    @GetMapping("/{bookingRef}/cancellation-quote")
    public ResponseEntity<ApiResponse<com.bookmyroute.dto.response.CancellationQuoteResponse>> getCancellationQuote(
            @PathVariable String bookingRef,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getCancellationQuote(bookingRef, userDetails.getUsername())));
    }

    // Changed from @PostMapping to @PatchMapping to match REST conventions
    // and the React frontend's bookingApi.cancelBooking which uses PATCH
    @PatchMapping("/{bookingRef}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable String bookingRef,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingResponse response = bookingService.cancelBooking(bookingRef, userDetails.getUsername());
        String message = Boolean.TRUE.equals(response.getNotificationEmailSent())
                ? "Booking cancelled, refund initiated, and cancellation email sent"
                : "Booking cancelled and refund initiated. Cancellation email was not sent: "
                        + response.getNotificationEmailMessage();
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<RouteReviewResponse>> submitReview(
            @Valid @RequestBody RouteReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        routeReviewService.submitReview(request, userDetails.getUsername()),
                        "Review submitted"));
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<RouteReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody RouteReviewUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                routeReviewService.updateReview(reviewId, request, userDetails.getUsername()),
                "Review updated"));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        routeReviewService.deleteReview(reviewId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted"));
    }

    @GetMapping("/reviews/booking/{bookingId}")
    public ResponseEntity<ApiResponse<RouteReviewResponse>> getReviewForBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                routeReviewService.getReviewForBooking(bookingId, userDetails.getUsername())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
    }
}
