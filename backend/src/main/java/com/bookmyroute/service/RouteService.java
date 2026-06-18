package com.bookmyroute.service;

import com.bookmyroute.dto.response.RouteResponse;
import com.bookmyroute.entity.Route;
import java.util.List;

public interface RouteService {
    Route createRoute(Route route);
    Route getRouteById(Long id);
    RouteResponse getRouteDetails(Long id);
    List<Route> getAllRoutes();
    List<Route> searchRoutes(String origin, String destination);
    Route updateRoute(Long id, Route route);
}
