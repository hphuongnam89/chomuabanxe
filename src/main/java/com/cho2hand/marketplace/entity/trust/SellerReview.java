package com.cho2hand.marketplace.entity.trust;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="seller_reviews")
public class SellerReview {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="review_id") private Long id;
    @Column(name="transaction_id") private Long transactionId;
    @Column(columnDefinition="tinyint unsigned") private short rating;
    private String body;
    private String status;
    @Column(name="created_at") private Instant createdAt;
    @Column(name="updated_at") private Instant updatedAt;
    @PrePersist void created(){createdAt=updatedAt=Instant.now();status="VISIBLE";}
    @PreUpdate void updated(){updatedAt=Instant.now();}
    public Long getId(){return id;} public Long getTransactionId(){return transactionId;}
    public short getRating(){return rating;} public String getBody(){return body;}
    public String getStatus(){return status;} public Instant getCreatedAt(){return createdAt;}
    public void setTransactionId(Long value){transactionId=value;} public void setRating(short value){rating=value;}
    public void setBody(String value){body=value;} public void setStatus(String value){status=value;}
}
