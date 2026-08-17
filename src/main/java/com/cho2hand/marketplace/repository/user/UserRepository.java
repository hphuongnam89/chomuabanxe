package com.cho2hand.marketplace.repository.user;

import com.cho2hand.marketplace.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("""
            select u from User u
            where (:statusId is null or u.userStatusId = :statusId)
              and (:query is null or lower(u.displayName) like lower(concat('%', :query, '%'))
                   or str(u.id) = :query)
            order by u.createdAt desc
            """)
    Page<User> searchForAdmin(@Param("query") String query, @Param("statusId") Long statusId, Pageable pageable);
}
