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
        // Spring usually wraps interceptor exceptions in a MessageDeliveryException. 
        // We need to extract the actual exception you threw.
        Throwable exception = ex;
        if (ex.getCause() != null) {
            exception = ex.getCause();
        }

        // Check if it's one of the exceptions you throw in your interceptor
        if (exception instanceof AccessDeniedException || exception instanceof MessagingException) {
            return handleCustomException(clientMessage, exception);
        }

        // For all other errors, use default Spring behavior
        return super.handleClientMessageProcessingError(clientMessage, ex);
    }

    private Message<byte[]> handleCustomException(Message<byte[]> clientMessage, Throwable ex) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
        
        // This sets the message header in the STOMP frame
        accessor.setMessage(ex.getMessage());
        accessor.setLeaveMutable(true);

        // This sets the body of the STOMP frame
        byte[] payload = ex.getMessage() != null ? ex.getMessage().getBytes() : new byte[0];
        
        return MessageBuilder.createMessage(payload, accessor.getMessageHeaders());
    }
}