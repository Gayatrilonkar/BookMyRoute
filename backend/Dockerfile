# Stage 1: Build the application using Maven
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app
# Copy the pom.xml
COPY pom.xml ./

# Download dependencies (this caches them in the Docker layer if pom.xml doesn't change)
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/bookmyroute-1.0.0.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
