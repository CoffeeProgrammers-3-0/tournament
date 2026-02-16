package com.project.backend.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Stream;

import static java.util.Collections.emptySet;
import static java.util.stream.Collectors.toSet;

@RequiredArgsConstructor
@Slf4j
@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final String clientId;

    @Override
    public AbstractAuthenticationToken convert(Jwt source)
    {
        return new JwtAuthenticationToken(source, Stream.concat(new JwtGrantedAuthoritiesConverter().convert(source)
                .stream(), extractResourceRoles(source).stream())
                .collect(toSet()));
    }

    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt)
    {
        var resourceAccess = new HashMap<>(jwt.getClaim("resource_access"));
        var resourceRoles = new ArrayList<>();

        if (resourceAccess.containsKey(clientId))
        {
            var resource = (Map<String, List<String>>) resourceAccess.get(clientId);
            resourceRoles.addAll(resource.get("roles"));
        }
        return resourceRoles.isEmpty() ? emptySet() : resourceRoles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).collect(toSet());
    }
}