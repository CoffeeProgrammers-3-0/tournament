FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

RUN apt-get update \
 && apt-get install -y curl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/target/backend-0.0.1-SNAPSHOT.jar backend.jar

COPY wait-for-keycloak.sh wait-for-keycloak.sh
RUN sed -i 's/\r$//' wait-for-keycloak.sh && chmod +x wait-for-keycloak.sh

ENTRYPOINT ["bash", "./wait-for-keycloak.sh", "java", "-jar", "backend.jar"]
