package com.cho2hand.marketplace.repository.location;
import com.cho2hand.marketplace.entity.location.Location;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByIdAndActiveTrue(Long id);
    List<Location> findByActiveTrueOrderByNameAsc();
    List<Location> findByParentLocationIdAndActiveTrue(Long parentLocationId);
    @Query("""
            select l from Location l
            where (:query is null or lower(l.name) like lower(concat('%', :query, '%')) or lower(l.code) = lower(:query))
              and (:level is null or l.level = :level)
            order by l.level, l.name
            """)
    Page<Location> searchForAdmin(@Param("query") String query, @Param("level") Byte level, Pageable pageable);
}
