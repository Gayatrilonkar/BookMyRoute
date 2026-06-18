package com.bookmyroute.service.impl;

import com.bookmyroute.dto.response.RouteResponse;
import com.bookmyroute.entity.Route;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.RouteRepository;
import com.bookmyroute.service.RouteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RouteServiceImpl implements RouteService {
    public RouteServiceImpl(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }


    private final RouteRepository routeRepository;

    @Override
    @Transactional
    public Route createRoute(Route route) {
        if (route.getPickupLocations() != null) {
            route.getPickupLocations().forEach(loc -> loc.setRoute(route));
        }
        if (route.getDropLocations() != null) {
            route.getDropLocations().forEach(loc -> loc.setRoute(route));
        }
        return routeRepository.save(route);
    }

    @Override
    @Transactional(readOnly = true)
    public Route getRouteById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id));
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse getRouteDetails(Long id) {
        Route route = getRouteById(id);
        RouteResponse response = new RouteResponse();
        response.setRouteId(route.getId());
        response.setOrigin(route.getOrigin());
        response.setDestination(route.getDestination());
        response.setDistanceKm(route.getDistanceKm());
        response.setDurationMins(route.getDurationMins());
        response.setIsActive(route.getIsActive());
        response.setCreatedAt(route.getCreatedAt());
        response.setUpdatedAt(route.getUpdatedAt());
        
        // Initialize lazy collections inside the transaction boundary
        if (route.getPickupLocations() != null) {
            response.setPickupLocations(List.copyOf(route.getPickupLocations()));
            // Touch sublocations to initialize them as well
            route.getPickupLocations().forEach(loc -> {
                if (loc.getSubLocations() != null) {
                    loc.getSubLocations().size();
                }
            });
        }
        if (route.getDropLocations() != null) {
            response.setDropLocations(List.copyOf(route.getDropLocations()));
            // Touch sublocations to initialize them as well
            route.getDropLocations().forEach(loc -> {
                if (loc.getSubLocations() != null) {
                    loc.getSubLocations().size();
                }
            });
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Route> searchRoutes(String origin, String destination) {
        return routeRepository.findByOriginIgnoreCaseAndDestinationIgnoreCase(origin, destination);
    }

    @Override
    @Transactional
    public Route updateRoute(Long id, Route updated) {
        Route route = getRouteById(id);
        route.setOrigin(updated.getOrigin());
        route.setDestination(updated.getDestination());
        route.setDistanceKm(updated.getDistanceKm());
        route.setDurationMins(updated.getDurationMins());

        if (updated.getPickupLocations() != null) {
            route.getPickupLocations().clear();
            updated.getPickupLocations().forEach(loc -> {
                loc.setRoute(route);
                route.getPickupLocations().add(loc);
            });
        }
        if (updated.getDropLocations() != null) {
            route.getDropLocations().clear();
            updated.getDropLocations().forEach(loc -> {
                loc.setRoute(route);
                route.getDropLocations().add(loc);
            });
        }
        return routeRepository.save(route);
    }
}
