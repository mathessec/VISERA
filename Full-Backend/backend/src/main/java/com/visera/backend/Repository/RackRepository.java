package com.visera.backend.Repository;
import com.visera.backend.Entity.Rack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RackRepository extends JpaRepository<Rack, Integer> {

    List<Rack> findByZoneId(int zoneId);
}

