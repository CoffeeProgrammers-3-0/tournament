package com.project.backend.auth.config;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;

import static org.springframework.security.web.util.matcher.RegexRequestMatcher.regexMatcher;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${client-id}")
    private String clientId;
    @Value("${frontend-url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter) throws Exception {
        String[] permitAll = new String[]{
                "/api-docs",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/api/auth/logout",
                "/api/auth/callback",
                "/api/auth/refresh",
                "/api/ws/**"
        };
        RegexRequestMatcher[] getPermitAll = new RegexRequestMatcher[]{
                regexMatcher(HttpMethod.GET, "^/api/rounds/\\d+/categories(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/\\d+/rounds(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/rounds-by-round/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/rounds/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/rounds/\\d+/leaderboard(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/rounds/\\d+/leaderboard/export(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/rounds/\\d+/juries(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/rounds/\\d+/teams(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/teams/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/teams(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/teams/tournament/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/tournaments(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/users/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/users/by_email(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/admin-messages/global(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/admin-messages/round/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/round-events/round/\\d+(\\?.*)?$"),
                regexMatcher(HttpMethod.GET, "^/api/round-events/\\d+(\\?.*)?$")
        };

        RegexRequestMatcher[] postPermitAll = new RegexRequestMatcher[]{
                regexMatcher(HttpMethod.POST, "^/api/teams/\\d+(\\?.*)?$")
        };
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(a -> a
                        .requestMatchers(permitAll).permitAll()
                        .requestMatchers(getPermitAll).permitAll()
                        .requestMatchers(postPermitAll).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtAuthenticationConverter)))
                .build();
    }
}
