# FROM openjdk:17-jdk
# Use lightweight OpenJDK base image
FROM eclipse-temurin:17-jre-alpine

# Set working directory inside the container
WORKDIR /app

# Copy the jar file from the build context to the container
COPY target/TaskIT.jar app.jar

# Expose the port your Spring Boot app listens on
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]

