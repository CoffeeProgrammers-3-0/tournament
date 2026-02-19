package com.project.backend.config;

import com.project.backend.auth.config.KeycloakJwtAuthenticationConverter;
import com.project.backend.auth.config.UserSecurity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TopicInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private final KeycloakJwtAuthenticationConverter converter;
    private final UserSecurity userSecurity;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    JwtAuthenticationToken auth = (JwtAuthenticationToken) converter.convert(jwt);
                    accessor.setUser(auth);
                    log.debug("Successfully called accessor.setUser with auth: {}", auth);
                } catch (JwtException e) {
                    log.error("Invalid JWT while connecting to WS: {}", e.getMessage());
                    throw new AccessDeniedException("Invalid JWT");
                }
            }
        }

//        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
//            String topic = accessor.getDestination();
//
//            if(topic == null) {
//                throw new IllegalArgumentException("Topic can not be null");
//            }
//
//            if(topic.startsWith("/topic/chatsAsSeller/") || topic.startsWith("/topic/chatsAsCustomer/") || topic.startsWith("/topic/notifications/") || topic.startsWith("/topic/chat/")) {
//                Authentication auth = (Authentication) accessor.getUser();
//                if (auth == null) {
//                    throw new AccessDeniedException("User is not authenticated");
//                }
//
//                try {
//                    String idPart = topic.substring(topic.lastIndexOf('/') + 1);
//                    Long resourceId = Long.parseLong(idPart);
//
//                    if (topic.startsWith("/topic/chatsAsSeller/") || topic.startsWith("/topic/chatsAsCustomer/") || topic.startsWith("/topic/notifications/")) {
//                        if (!userSecurity.checkUser(resourceId, auth)) {
//                            throw new AccessDeniedException("You cannot subscribe to someone else's topic!");
//                        }
//                    } else if (topic.startsWith("/topic/chat/")) {
//                        if (!userSecurity.isParticipantOfChat(resourceId, auth)) {
//                            throw new AccessDeniedException("You are not a participant of this chat!");
//                        }
//                    }
//                } catch (NumberFormatException | IndexOutOfBoundsException e) {
//                    throw new AccessDeniedException("Invalid topic format");
//                }
//            }
//        }

        return message;
    }
}