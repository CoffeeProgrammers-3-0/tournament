package com.project.backend.auth.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
public class SecurityUtil {

    public static String extractRole(String clientId, Jwt accessTokenJwt) {
        return Optional.ofNullable(accessTokenJwt.getClaim("resource_access"))
                .map(resourceAccess -> {
                    log.info("resource_access claim: {}", resourceAccess);
                    return ((Map<String, Object>) resourceAccess).get(clientId);
                })
                .map(clientAccess -> {
                    log.info("clientAccess for '{}': {}", clientId, clientAccess);
                    return (Map<String, Object>) clientAccess;
                })
                .map(clientMap -> {
                    List<String> roles = (List<String>) clientMap.get("roles");
                    log.info("roles list: {}", roles);
                    return roles;
                })
                .filter(roles -> {
                    boolean nonEmpty = !roles.isEmpty();
                    log.info("roles non-empty? {}", nonEmpty);
                    return nonEmpty;
                })
                .map(roles -> {
                    String first = roles.get(0);
                    log.info("selected role: {}", first);
                    return first;
                })
                .orElseGet(() -> {
                    log.warn("No role found for client '{}', returning empty string", clientId);
                    return "";
                });
    }

    public static Map sendRequestToTokenEndpoint(WebClient webClient, String realm, MultiValueMap<String, String> formData) {
        return webClient.post()
                .uri("/realms/" + realm + "/protocol/openid-connect/token")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue(formData)
                .retrieve()
                .toEntity(Map.class)
                .block()
                .getBody();
    }
}
