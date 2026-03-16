package com.project.backend.auth.controllers;

import com.project.backend.auth.utils.CookieUtil;
import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.wrapper.PasswordRequest;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.services.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.resource.RealmResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static com.project.backend.auth.utils.CookieUtil.deleteAllCookies;
import static com.project.backend.auth.utils.SecurityUtil.extractRole;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and Keycloak integration endpoints")
public class AuthController {

    private final WebClient webClient;

    @Value("${realm}")
    private String realm;
    @Value("${client-secret}")
    private String clientSecret;
    @Value("${client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.coffee-programmers-client.redirect-uri}")
    private String redirectUri;
    private final UserService userService;
    private final JwtDecoder jwtDecoder;
    private final RealmResource realmResource;

    @PutMapping("/update-password")
    @Operation(summary = "Update password", description = "Updates password for the authenticated user")
    public boolean updateMyPassword(
            @Parameter(description = "Password update request")
            @RequestBody PasswordRequest password,

            @Parameter(hidden = true)
            Authentication auth) {
        log.info("Controller: Update my password");
        return userService.updatePassword(password, userService.findUserByAuth(auth));
    }

    @GetMapping("/callback")
    @Operation(summary = "OAuth2 callback", description = "Exchange authorization code for access and refresh tokens")
    public ResponseEntity<Void> exchangeCode(
            @Parameter(description = "Authorization code from Keycloak", example = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
            @RequestParam String code) {
        log.info(code);
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("code", code);
        formData.add("redirect_uri", redirectUri);
        formData.add("client_id", clientId);
        if (clientSecret != null) {
            formData.add("client_secret", clientSecret);
        }

        return requestToken(formData);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Exchanges a refresh token for new access and refresh tokens")
    public ResponseEntity<Void> refreshToken(
            @Parameter(description = "Refresh token string", example = "xxxx.xxxx.xxxx")
            @RequestParam String refreshToken) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "refresh_token");
        formData.add("refresh_token", refreshToken);
        formData.add("client_id", clientId);
        if (clientSecret != null) {
            formData.add("client_secret", clientSecret);
        }

        return requestToken(formData);
    }

    private ResponseEntity<Void> requestToken(MultiValueMap<String, String> formData) {
        try {
            return handleResponse(
                    SecurityUtil.sendRequestToTokenEndpoint(webClient, realm, formData)
            );
        } catch (WebClientResponseException e) {
            log.error("Controller: {} Error response from Keycloak: {}", e.getRawStatusCode(), e.getResponseBodyAsString());

            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        }
    }


    private ResponseEntity<Void> handleResponse(Map response) {
        String accessTokenString = (String) response.get("access_token");
        String refreshTokenString = (String) response.get("refresh_token");
        String idTokenString = (String) response.get("id_token");

        Jwt accessToken = jwtDecoder.decode(accessTokenString);
        Jwt idToken = jwtDecoder.decode(idTokenString);

        String email = idToken.getClaim("email");
        String role = extractRole(clientId, accessToken);

        User user = new User();
        user.setEmail(email);
        user.setFullName(idToken.getClaim("full_name"));
        user.setKeycloakUserId(idToken.getClaim("sub"));
        user.setRole(Role.valueOf(role.toUpperCase()));

        if (userService.isNotExistByEmail(email)) {
            user = userService.createUserKeycloak(user);
        } else {
            user = userService.updateUserKeycloak(user, userService.findUserByEmail(email).getId());
        }

        List<String> cookies = CookieUtil.createCookiesFromJWTs(
                user,
                accessTokenString,
                refreshTokenString,
                role,
                Long.parseLong(response.get("expires_in").toString()),
                Long.parseLong(response.get("refresh_expires_in").toString())
        );

        return ResponseEntity
                .ok()
                .headers(httpHeaders -> httpHeaders.put(HttpHeaders.SET_COOKIE, cookies))
                .build();
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Logs out a user and deletes authentication cookies")
    public ResponseEntity<Void> logout(
            @Parameter(description = "ID of the user to logout", example = "1")
            @RequestParam Long userId) {
        log.info("AuthController: Logout user");
        realmResource.users().get(userService.findById(userId).getKeycloakUserId()).logout();
        return ResponseEntity.ok()
                .headers(headers -> headers.put(HttpHeaders.SET_COOKIE, deleteAllCookies()))
                .build();
    }
}