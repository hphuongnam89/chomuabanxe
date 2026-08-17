package com.cho2hand.marketplace.exception; public class ConversationNotFoundException extends RuntimeException{public ConversationNotFoundException(Long id){super("Conversation not found: "+id);}}
