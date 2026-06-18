package com.bookmyroute.config;

import com.bookmyroute.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── Public endpoints ──────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/auth/oauth/google").permitAll()  // Google OAuth
                .requestMatchers(HttpMethod.GET,  "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/support/requests").permitAll()

                // Swagger / OpenAPI
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // Public search & browse
                .requestMatchers(HttpMethod.GET, "/api/schedules/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/schedules/*/seats").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/schedules/*/seats/stream").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/routes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/routes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/buses/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/chatbot/message").permitAll()

                // ── Admin-only write operations ───────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/buses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/buses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/buses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/routes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/routes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/schedules/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/schedules/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/schedules/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // ── All others require authentication ─────────────────────
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}