package com.cho2hand.marketplace.entity.media;
import jakarta.persistence.*;
@Entity @Table(name="listing_images") public class ListingImage { @EmbeddedId private ListingImageId id; @Column(name="sort_order",nullable=false) private short sortOrder; protected ListingImage(){} public ListingImage(Long l,Long m,short s){id=new ListingImageId(l,m);sortOrder=s;} public ListingImageId getId(){return id;} public short getSortOrder(){return sortOrder;} }
