package com.visera.backend.Service;

import com.visera.backend.Entity.Bin;
import com.visera.backend.Entity.InventoryStock;
import com.visera.backend.Entity.Sku;

public interface InventoryStockService {
    InventoryStock updateStock(int skuId, int binId, int quantity);
    InventoryStock getStock(int skuId, int binId);
    InventoryStock createStock(InventoryStock stock);
}

