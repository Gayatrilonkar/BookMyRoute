package com.bookmyroute;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BookMyRouteApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookMyRouteApplication.class, args);
    }
}