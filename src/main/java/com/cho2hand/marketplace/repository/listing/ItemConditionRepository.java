package com.cho2hand.marketplace.repository.listing;
import com.cho2hand.marketplace.entity.listing.ItemCondition;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ItemConditionRepository extends JpaRepository<ItemCondition, Long> { Optional<ItemCondition> findByIdAndActiveTrue(Long id); }
