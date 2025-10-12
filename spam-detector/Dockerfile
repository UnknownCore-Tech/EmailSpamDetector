# Multi-stage build
FROM eclipse-temurin:17-jdk-alpine AS build

# Set working directory for build
WORKDIR /app

# Copy gradle files and source code
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/
COPY config config/
COPY backend/build.gradle backend/
COPY backend/src backend/src/

# Make gradlew executable and build
RUN chmod +x ./gradlew && ./gradlew :backend:build -x test

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001 -G spring

# Set working directory
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/backend/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=production", "app.jar"]