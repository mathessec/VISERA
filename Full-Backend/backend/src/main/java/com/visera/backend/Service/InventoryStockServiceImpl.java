package com.visera.backend.Service;

import com.visera.backend.Entity.Bin;
import com.visera.backend.Entity.InventoryStock;
import com.visera.backend.Entity.Sku;
import com.visera.backend.Repository.BinRepository;
import com.visera.backend.Repository.InventoryStockRepository;
import com.visera.backend.Repository.SkuRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InventoryStockServiceImpl implements InventoryStockService {

    private final InventoryStockRepository repo;
    private final SkuRepository skuRepo;
    private final BinRepository binRepo;

    public InventoryStockServiceImpl(InventoryStockRepository repo,
                                     SkuRepository skuRepo,
                                     BinRepository binRepo) {
        this.repo = repo;
        this.skuRepo = skuRepo;
        this.binRepo = binRepo;
    }

    @Override
    public InventoryStock updateStock(int skuId, int binId, int quantity) {

        Sku sku = skuRepo.findById(skuId).orElse(null);
        Bin bin = binRepo.findById(binId).orElse(null);

        if (sku == null || bin == null) return null;

        InventoryStock stock = repo.findBySkuIdAndBinId(sku, bin)
                .orElse(InventoryStock.builder()
                        .sku(sku)
                        .bin(bin)
                        .build()
                );

        stock.setQuantity(quantity);
        stock.setUpdatedAt(LocalDateTime.now());

        return repo.save(stock);
    }

    @Override
    public InventoryStock createStock(InventoryStock stock) {
//        stock.setUpdatedAt(LocalDateTime.now());
        return repo.save(stock);
    }

    @Override
    public InventoryStock getStock(int skuId, int binId) {
        Sku sku = skuRepo.findById(skuId).orElse(null);
        Bin bin = binRepo.findById(binId).orElse(null);

        if (sku == null || bin == null) return null;

        return repo.findBySkuIdAndBinId(sku, bin).orElse(null);
    }
}
