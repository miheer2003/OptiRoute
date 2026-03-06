package com.optiroute.service;

import com.optiroute.model.Admin;
import com.optiroute.model.DirectRoute;
import com.optiroute.model.User;
import com.optiroute.repository.AdminRepository;
import com.optiroute.repository.DirectRouteRepository;
import com.optiroute.repository.UserRepository;
import com.optiroute.repository.LocationRepository;
import com.optiroute.model.Location;
import com.optiroute.model.LocationType;
import com.optiroute.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DirectRouteRepository routeRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public String login(String username, String password) {
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);

        // For simplicity as requested, we can also check hardcoded credentials if DB is
        // empty
        if (adminOpt.isEmpty() && "admin".equals(username) && "admin123".equals(password)) {
            // Create default admin if not exists (lazy init for demo)
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            adminRepository.save(admin);
            return jwtTokenProvider.createToken(username, "ROLE_ADMIN");
        }

        if (adminOpt.isPresent()) {
            if (passwordEncoder.matches(password, adminOpt.get().getPassword())) {
                return jwtTokenProvider.createToken(username, "ROLE_ADMIN");
            }
        }

        throw new RuntimeException("Invalid admin credentials");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    // Helper to get all routes (simplification for "Routes Today" if we assume all
    // are today or filter in memory)
    public List<DirectRoute> getAllRoutes() {
        return routeRepository.findAll();
    }

    public DirectRoute addRoute(DirectRoute route) {
        // Resolve From Location
        if (route.getFromLocation() != null) {
            String name = route.getFromLocation().getName();
            Long id = route.getFromLocation().getId();
            Location loc = null;
            if (name != null && !name.isEmpty()) {
                loc = locationRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> {
                            Location newLoc = new Location();
                            newLoc.setName(name);
                            newLoc.setType(LocationType.CITY);
                            return locationRepository.save(newLoc);
                        });
            } else if (id != null) {
                loc = locationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("From Location ID not found: " + id));
            }
            if (loc != null)
                route.setFromLocation(loc);
        }

        // Resolve To Location
        if (route.getToLocation() != null) {
            String name = route.getToLocation().getName();
            Long id = route.getToLocation().getId();
            Location loc = null;
            if (name != null && !name.isEmpty()) {
                loc = locationRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> {
                            Location newLoc = new Location();
                            newLoc.setName(name);
                            newLoc.setType(LocationType.CITY);
                            return locationRepository.save(newLoc);
                        });
            } else if (id != null) {
                loc = locationRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("To Location ID not found: " + id));
            }
            if (loc != null)
                route.setToLocation(loc);
        }

        return routeRepository.save(route);
    }

    public void deleteRoute(Long routeId) {
        routeRepository.deleteById(routeId);
    }

    public DirectRoute assignOperator(Long routeId, String operatorName) {
        DirectRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found"));
        route.setOperator(operatorName);
        return routeRepository.save(route);
    }

    public com.optiroute.dto.UserProfileDto getAdminProfile(String username) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return new com.optiroute.dto.UserProfileDto(admin.getUsername(), admin.getEmail(), admin.getMobileNumber());
    }

    public String updateAdminProfile(String username, com.optiroute.dto.UpdateProfileRequest request) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (request.getMobileNumber() != null) { // Allow clearing or setting
            admin.setMobileNumber(request.getMobileNumber());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        adminRepository.save(admin);
        return "Admin profile updated successfully";
    }
}
