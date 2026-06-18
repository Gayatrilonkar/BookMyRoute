package com.bookmyroute.service;

import com.bookmyroute.dto.request.ScheduleSearchRequest;
import com.bookmyroute.dto.response.ScheduleResponse;
import com.bookmyroute.entity.Schedule;

import java.util.List;

public interface ScheduleService {
    Schedule createSchedule(Schedule schedule);
    Schedule getScheduleById(Long id);
    Schedule updateSchedule(Long id, Schedule schedule);
    List<ScheduleResponse.Search> searchSchedules(ScheduleSearchRequest request);
    List<ScheduleResponse.SeatInfo> getAvailableSeats(Long scheduleId);
    void deactivateSchedule(Long id);
    org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribeToSeats(Long scheduleId);
    void broadcastSeatUpdates(Long scheduleId);
}
