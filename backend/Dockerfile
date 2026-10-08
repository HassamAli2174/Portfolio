# ---- Build ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Dependencies first, so they stay cached until pom.xml changes.
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src src
RUN ./mvnw -B -q -DskipTests package && cp target/*.jar app.jar

# ---- Run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app
COPY --from=build /app/app.jar app.jar
USER app

# Hosts like Render set PORT; application.properties reads it (default 8080).
EXPOSE 8080
# Fit the heap to small free-tier containers (512 MB).
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:TieredStopAtLevel=1"
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
