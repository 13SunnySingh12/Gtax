# G-TAX Spring Boot backend — standalone Dockerfile.
# Build context is this folder, so container hosts (e.g. Render, Railway, Fly)
# can build the backend directly from the Backend/ directory.
# Multi-stage: Maven build -> slim JRE runtime.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/gtax-backend.jar app.jar
# Hosts inject $PORT; default to 8080 for local runs.
ENV PORT=8080
ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${PORT:-8080}"]
