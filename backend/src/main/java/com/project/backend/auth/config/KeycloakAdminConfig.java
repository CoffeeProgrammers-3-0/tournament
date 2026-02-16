package com.project.backend.auth.config;

import lombok.RequiredArgsConstructor;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.ClientResource;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
public class KeycloakAdminConfig {

    @Value("${realm}")
    private String realm;
    @Value("${client-id}")
    private String clientId;
    @Value("${keycloak-url}")
    private String keycloakUrl;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(keycloakUrl)
                .realm("master")
                .grantType(OAuth2Constants.PASSWORD)
                .clientId("admin-cli")
                .username("admin")
                .password("admin")
                .build();
    }

    @Bean
    public RealmResource realmResource(Keycloak keycloak) {
        return keycloak.realm(realm);
    }

    @Bean
    public ClientResource clientResource(RealmResource realmResource, String clientUUID) {
        return realmResource.clients().get(clientUUID);
    }

    @Bean
    public String clientUUID(RealmResource realmResource) {
        return realmResource.clients().findByClientId(clientId).get(0).getId();
    }

    @Bean
    public Map<String, RoleRepresentation> clientRoles(ClientResource clientResource) {
        return clientResource.roles().list().stream().collect(Collectors.toMap(RoleRepresentation::getName, Function.identity()));
    }

    @Bean
    public WebClient webClient() {
        return WebClient.create(keycloakUrl);
    }
}

