package com.cho2hand.marketplace.repository.chat; import com.cho2hand.marketplace.entity.chat.Message; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface MessageRepository extends JpaRepository<Message,Long>{List<Message> findByConversationIdOrderBySentAtAsc(Long id);}
