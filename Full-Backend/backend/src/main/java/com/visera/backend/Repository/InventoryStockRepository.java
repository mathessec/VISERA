package com.visera.backend.Repository;
import com.visera.backend.Entity.Bin;
import com.visera.backend.Entity.InventoryStock;
import com.visera.backend.Entity.Sku;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryStockRepository extends JpaRepository<InventoryStock, Integer> {

    List<InventoryStock> findBySkuId(int skuId);

    List<InventoryStock> findByBinId(int binId);

    Optional<InventoryStock> findBySkuIdAndBinId(Sku skuId, Bin binId);
}
