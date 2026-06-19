package com.bookmyroute.service;

import com.bookmyroute.entity.Booking;
import com.bookmyroute.repository.BookingRepository;
import com.bookmyroute.dto.response.EmailDeliveryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JourneyReminderService {
    private static final Logger log = LoggerFactory.getLogger(JourneyReminderService.class);

    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final int hoursBeforeDeparture;

    public JourneyReminderService(BookingRepository bookingRepository,
                                  EmailService emailService,
                                  @Value("${journey.reminder.hours-before-departure:24}") int hoursBeforeDeparture) {
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.hoursBeforeDeparture = hoursBeforeDeparture;
    }

    // Run every hour by default
    @Scheduled(fixedRateString = "${journey.reminder.check.interval:3600000}")
    @Transactional
    public void processJourneyReminders() {
        log.info("Starting journey reminder batch process...");
        LocalDateTime now = LocalDateTime.now();
        
        // Find bookings that depart between exactly now + X hours and exactly now + X hours + 1 hour.
        // This ensures if the job runs every hour, we catch all buses departing in the Xth hour from now.
        LocalDateTime startTime = now.plusHours(hoursBeforeDeparture - 1);
        LocalDateTime endTime = now.plusHours(hoursBeforeDeparture);

        List<Booking> eligibleBookings = bookingRepository.findBookingsForReminder(startTime, endTime);
        
        if (eligibleBookings.isEmpty()) {
            log.info("No eligible bookings found for journey reminders between {} and {}", startTime, endTime);
            return;
        }

        log.info("Found {} eligible bookings for journey reminders", eligibleBookings.size());

        int successCount = 0;
        int failureCount = 0;

        for (Booking booking : eligibleBookings) {
            try {
                EmailDeliveryResponse response = emailService.sendJourneyReminder(booking);
                
                if (response.isSent()) {
                    booking.setJourneyReminderSent(true);
                    booking.setJourneyReminderSentAt(LocalDateTime.now());
                    bookingRepository.save(booking);
                    successCount++;
                } else {
                    log.warn("Failed to send journey reminder for booking {}: {}", booking.getBookingRef(), response.getMessage());
                    failureCount++;
                }
            } catch (Exception e) {
                log.error("Unexpected error while sending journey reminder for booking {}", booking.getBookingRef(), e);
                failureCount++;
            }
        }

        log.info("Journey reminder batch process completed. Success: {}, Failed: {}", successCount, failureCount);
    }
}
