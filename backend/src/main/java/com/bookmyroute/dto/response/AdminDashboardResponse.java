package com.bookmyroute.dto.response;

import java.math.BigDecimal;

public class AdminDashboardResponse {

    private long totalUsers;
    private long activeUsers;
    private long newUsersToday;
    private long newUsersThisMonth;

    private long totalBookings;
    private long todaysBookings;
    private long monthlyBookings;
    private long cancelledBookings;
    private long completedBookings;

    private BigDecimal todaysRevenue = BigDecimal.ZERO;
    private BigDecimal weeklyRevenue = BigDecimal.ZERO;
    private BigDecimal monthlyRevenue = BigDecimal.ZERO;
    private BigDecimal yearlyRevenue = BigDecimal.ZERO;
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    private long activeBuses;
    private long totalRoutes;
    private long activeSchedules;

    public AdminDashboardResponse() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    public long getNewUsersToday() { return newUsersToday; }
    public void setNewUsersToday(long newUsersToday) { this.newUsersToday = newUsersToday; }
    public long getNewUsersThisMonth() { return newUsersThisMonth; }
    public void setNewUsersThisMonth(long newUsersThisMonth) { this.newUsersThisMonth = newUsersThisMonth; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getTodaysBookings() { return todaysBookings; }
    public void setTodaysBookings(long todaysBookings) { this.todaysBookings = todaysBookings; }
    public long getMonthlyBookings() { return monthlyBookings; }
    public void setMonthlyBookings(long monthlyBookings) { this.monthlyBookings = monthlyBookings; }
    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
    public long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(long completedBookings) { this.completedBookings = completedBookings; }

    public BigDecimal getTodaysRevenue() { return todaysRevenue; }
    public void setTodaysRevenue(BigDecimal todaysRevenue) { this.todaysRevenue = todaysRevenue; }
    public BigDecimal getWeeklyRevenue() { return weeklyRevenue; }
    public void setWeeklyRevenue(BigDecimal weeklyRevenue) { this.weeklyRevenue = weeklyRevenue; }
    public BigDecimal getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(BigDecimal monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    public BigDecimal getYearlyRevenue() { return yearlyRevenue; }
    public void setYearlyRevenue(BigDecimal yearlyRevenue) { this.yearlyRevenue = yearlyRevenue; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getActiveBuses() { return activeBuses; }
    public void setActiveBuses(long activeBuses) { this.activeBuses = activeBuses; }
    public long getTotalRoutes() { return totalRoutes; }
    public void setTotalRoutes(long totalRoutes) { this.totalRoutes = totalRoutes; }
    public long getActiveSchedules() { return activeSchedules; }
    public void setActiveSchedules(long activeSchedules) { this.activeSchedules = activeSchedules; }
}
