package com.project.backend.exception;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

public class CustomStompErrorHandler extends StompSubProtocolErrorHandler {

    @Override
    public Message<byte[]> handleClientMessageProcessingError(Message<byte[]> clientMessage, Throwable ex) {
        Throwable exception = ex;
        if (ex.getCause() != null) {
            exception = ex.getCause();
        }

        if (exception instanceof AccessDeniedException || exception instanceof MessagingException) {
            return handleCustomException(clientMessage, exception);
        }

        return super.handleClientMessageProcessingError(clientMessage, ex);
    }

    private Message<byte[]> handleCustomException(Message<byte[]> clientMessage, Throwable ex) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);

        accessor.setMessage(ex.getMessage());
        accessor.setLeaveMutable(true);

        byte[] payload = ex.getMessage() != null ? ex.getMessage().getBytes() : new byte[0];
        
        return MessageBuilder.createMessage(payload, accessor.getMessageHeaders());
    }
}