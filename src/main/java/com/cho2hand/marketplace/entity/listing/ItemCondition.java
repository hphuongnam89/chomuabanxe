package com.cho2hand.marketplace.entity.listing;
import jakarta.persistence.*;
@Entity @Table(name = "conditions") public class ItemCondition { @Id @Column(name = "condition_id") private Long id; @Column(name="is_active") private boolean active; public Long getId(){return id;} }
