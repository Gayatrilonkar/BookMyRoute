package com.bookmyroute.controller;

import com.bookmyroute.dto.response.ApiResponse;
import com.bookmyroute.dto.response.RouteResponse;
import com.bookmyroute.entity.Route;
import com.bookmyroute.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Route>> createRoute(@RequestBody Route route) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(routeService.createRoute(route), "Route created"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Route>>> getAllRoutes() {
        return ResponseEntity.ok(ApiResponse.success(routeService.getAllRoutes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponse>> getRoute(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(routeService.getRouteDetails(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Route>>> searchRoutes(
            @RequestParam String origin,
            @RequestParam String destination) {
        return ResponseEntity.ok(ApiResponse.success(routeService.searchRoutes(origin, destination)));
    }

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<String>>> getCities() {
        List<String> cities = routeService.getAllRoutes().stream()
                .flatMap(r -> java.util.stream.Stream.of(r.getOrigin(), r.getDestination()))
                .distinct()
                .sorted()
                .toList();
        return ResponseEntity.ok(ApiResponse.success(cities));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Route>> updateRoute(@PathVariable Long id,
                                                          @RequestBody Route route) {
        return ResponseEntity.ok(ApiResponse.success(routeService.updateRoute(id, route), "Route updated"));
    }
}
