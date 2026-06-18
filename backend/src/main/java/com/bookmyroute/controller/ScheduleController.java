package com.bookmyroute.controller;

import com.bookmyroute.dto.request.ScheduleSearchRequest;
import com.bookmyroute.dto.response.ApiResponse;
import com.bookmyroute.dto.response.ScheduleResponse;
import com.bookmyroute.entity.Schedule;
import com.bookmyroute.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(@RequestBody Schedule schedule) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.createSchedule(schedule), "Schedule created"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ScheduleResponse.Search>>> search(
            @Valid @ModelAttribute ScheduleSearchRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.searchSchedules(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Schedule>> getSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getScheduleById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Schedule>> updateSchedule(@PathVariable Long id,
                                                                @RequestBody Schedule schedule) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.updateSchedule(id, schedule), "Schedule updated"));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<List<ScheduleResponse.SeatInfo>>> getAvailableSeats(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAvailableSeats(id)));
    }

    @GetMapping("/{id}/seats/stream")
    public SseEmitter streamAvailableSeats(@PathVariable Long id) {
        return scheduleService.subscribeToSeats(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateSchedule(@PathVariable Long id) {
        scheduleService.deactivateSchedule(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Schedule deactivated"));
    }
}
