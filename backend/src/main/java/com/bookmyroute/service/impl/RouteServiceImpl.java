package com.bookmyroute.service.impl;

import com.bookmyroute.dto.response.RouteResponse;
import com.bookmyroute.entity.Route;
import com.bookmyroute.entity.PickupLocation;
import com.bookmyroute.entity.DropLocation;
import com.bookmyroute.entity.PickupSubLocation;
import com.bookmyroute.entity.DropSubLocation;
import com.bookmyroute.exception.ResourceNotFoundException;
import com.bookmyroute.repository.RouteRepository;
import com.bookmyroute.service.RouteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.HashSet;

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
    @Transactional(readOnly = true)
    public List<String> getAllCities() {
        List<Route> routes = routeRepository.findAll();
        Set<String> locations = new HashSet<>();
        for (Route r : routes) {
            locations.add(r.getOrigin());
            locations.add(r.getDestination());
            if (r.getPickupLocations() != null) {
                for (PickupLocation pl : r.getPickupLocations()) {
                    locations.add(pl.getPickupName());
                    if (pl.getSubLocations() != null) {
                        pl.getSubLocations().forEach(sub -> locations.add(sub.getSubLocationName()));
                    }
                }
            }
            if (r.getDropLocations() != null) {
                for (DropLocation dl : r.getDropLocations()) {
                    locations.add(dl.getDropName());
                    if (dl.getSubLocations() != null) {
                        dl.getSubLocations().forEach(sub -> locations.add(sub.getSubLocationName()));
                    }
                }
            }
        }
        return locations.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .distinct()
                .sorted()
                .toList();
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
            route.getPickupLocations().removeIf(existing -> 
                updated.getPickupLocations().stream()
                    .noneMatch(upd -> upd.getId() != null && upd.getId().equals(existing.getId()))
            );
            
            for (PickupLocation updatedLoc : updated.getPickupLocations()) {
                if (updatedLoc.getId() != null) {
                    route.getPickupLocations().stream()
                        .filter(l -> updatedLoc.getId().equals(l.getId()))
                        .findFirst()
                        .ifPresent(existing -> {
                            existing.setPickupName(updatedLoc.getPickupName());
                            existing.setPickupAddress(updatedLoc.getPickupAddress());
                            existing.setPickupTime(updatedLoc.getPickupTime());
                            existing.setLandmark(updatedLoc.getLandmark());
                            existing.setSequenceOrder(updatedLoc.getSequenceOrder());
                            updatePickupSubLocations(existing, updatedLoc.getSubLocations());
                        });
                } else {
                    updatedLoc.setRoute(route);
                    if (updatedLoc.getSubLocations() != null) {
                        updatedLoc.getSubLocations().forEach(sub -> sub.setPickupLocation(updatedLoc));
                    }
                    route.getPickupLocations().add(updatedLoc);
                }
            }
        } else {
             route.getPickupLocations().clear();
        }

        if (updated.getDropLocations() != null) {
            route.getDropLocations().removeIf(existing -> 
                updated.getDropLocations().stream()
                    .noneMatch(upd -> upd.getId() != null && upd.getId().equals(existing.getId()))
            );
            
            for (DropLocation updatedLoc : updated.getDropLocations()) {
                if (updatedLoc.getId() != null) {
                    route.getDropLocations().stream()
                        .filter(l -> updatedLoc.getId().equals(l.getId()))
                        .findFirst()
                        .ifPresent(existing -> {
                            existing.setDropName(updatedLoc.getDropName());
                            existing.setDropAddress(updatedLoc.getDropAddress());
                            existing.setDropTime(updatedLoc.getDropTime());
                            existing.setLandmark(updatedLoc.getLandmark());
                            existing.setSequenceOrder(updatedLoc.getSequenceOrder());
                            updateDropSubLocations(existing, updatedLoc.getSubLocations());
                        });
                } else {
                    updatedLoc.setRoute(route);
                    if (updatedLoc.getSubLocations() != null) {
                        updatedLoc.getSubLocations().forEach(sub -> sub.setDropLocation(updatedLoc));
                    }
                    route.getDropLocations().add(updatedLoc);
                }
            }
        } else {
             route.getDropLocations().clear();
        }

        return routeRepository.save(route);
    }

    private void updatePickupSubLocations(PickupLocation existing, List<PickupSubLocation> updatedList) {
        if (updatedList == null) {
            existing.getSubLocations().clear();
            return;
        }
        
        existing.getSubLocations().removeIf(sub -> 
            updatedList.stream().noneMatch(u -> u.getId() != null && u.getId().equals(sub.getId()))
        );
        
        for (PickupSubLocation updatedSub : updatedList) {
            if (updatedSub.getId() != null) {
                existing.getSubLocations().stream()
                    .filter(s -> updatedSub.getId().equals(s.getId()))
                    .findFirst()
                    .ifPresent(sub -> {
                        sub.setSubLocationName(updatedSub.getSubLocationName());
                        sub.setSequenceOrder(updatedSub.getSequenceOrder());
                    });
            } else {
                updatedSub.setPickupLocation(existing);
                existing.getSubLocations().add(updatedSub);
            }
        }
    }

    private void updateDropSubLocations(DropLocation existing, List<DropSubLocation> updatedList) {
        if (updatedList == null) {
            existing.getSubLocations().clear();
            return;
        }
        
        existing.getSubLocations().removeIf(sub -> 
            updatedList.stream().noneMatch(u -> u.getId() != null && u.getId().equals(sub.getId()))
        );
        
        for (DropSubLocation updatedSub : updatedList) {
            if (updatedSub.getId() != null) {
                existing.getSubLocations().stream()
                    .filter(s -> updatedSub.getId().equals(s.getId()))
                    .findFirst()
                    .ifPresent(sub -> {
                        sub.setSubLocationName(updatedSub.getSubLocationName());
                        sub.setSequenceOrder(updatedSub.getSequenceOrder());
                    });
            } else {
                updatedSub.setDropLocation(existing);
                existing.getSubLocations().add(updatedSub);
            }
        }
    }
}
