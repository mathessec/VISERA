package com.visera.backend.Service;
import com.visera.backend.Entity.Sku;
import java.util.List;

public interface SkuService {
    Sku createSku(Sku sku);
    Sku getSkuById(int id);
    List<Sku> getAllSkus();
    Sku updateSku(int id, Sku sku);
    void deleteSku(int id);
}

