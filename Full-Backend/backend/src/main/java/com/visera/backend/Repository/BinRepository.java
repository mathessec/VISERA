package com.visera.backend.Repository;
import com.visera.backend.Entity.Bin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BinRepository extends JpaRepository<Bin, Integer> {

    List<Bin> findByRackId(int rackId);

    boolean existsByCode(String code);
}

