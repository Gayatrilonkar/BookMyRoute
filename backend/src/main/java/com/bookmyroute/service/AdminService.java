package com.bookmyroute.service;

import com.bookmyroute.dto.request.AdminUserUpdateRequest;
import com.bookmyroute.dto.request.AdminRouteRequest;
import com.bookmyroute.dto.request.AdminScheduleRequest;
import com.bookmyroute.dto.response.AdminBusResponse;
import com.bookmyroute.dto.response.AdminDashboardResponse;
import com.bookmyroute.dto.response.AdminRouteResponse;
import com.bookmyroute.dto.response.AdminScheduleResponse;
import com.bookmyroute.dto.response.AdminUserResponse;
import com.bookmyroute.dto.response.BookingResponse;
import com.bookmyroute.enums.BookingStatus;
import com.bookmyroute.enums.Role;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminService {
    AdminDashboardResponse getDashboard();
    List<AdminBusResponse> getBuses(Boolean active);
    AdminBusResponse createBus(com.bookmyroute.dto.request.AdminBusRequest request);
    AdminBusResponse updateBus(Long busId, com.bookmyroute.dto.request.AdminBusRequest request);
    AdminBusResponse toggleBusStatus(Long busId);
    List<AdminRouteResponse> getRoutes();
    AdminRouteResponse createRoute(AdminRouteRequest request);
    AdminRouteResponse updateRoute(Long routeId, AdminRouteRequest request);
    void deleteRoute(Long routeId);
    List<AdminScheduleResponse> getSchedules(Boolean active);
    AdminScheduleResponse createSchedule(AdminScheduleRequest request);
    AdminScheduleResponse updateSchedule(Long scheduleId, AdminScheduleRequest request);
    List<AdminUserResponse> getUsers(Role role, Boolean active);
    AdminUserResponse updateUser(Long userId, AdminUserUpdateRequest request);
    List<BookingResponse> getBookings(BookingStatus status, Long userId, LocalDateTime from, LocalDateTime to);
    BookingResponse cancelBooking(String bookingRef);
    
    List<com.bookmyroute.entity.SystemSetting> getSettings();
    List<com.bookmyroute.entity.SystemSetting> updateSettings(java.util.Map<String, String> settings);
    List<com.bookmyroute.entity.AdminActionLog> getLogs();
}
