package com.cho2hand.marketplace.exception;public class TransactionNotFoundException extends RuntimeException{public TransactionNotFoundException(Long id){super("Transaction not found: "+id);}}
