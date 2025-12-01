package com.visera.backend.Repository;

import com.visera.backend.Entity.Sku;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkuRepository extends JpaRepository<Sku, Integer> {

    Optional<Sku> findBySkuCode(String skuCode);

    boolean existsBySkuCode(String skuCode);
}
