package com.visera.backend.Service;
import com.visera.backend.DTOs.SkuDTO;
import com.visera.backend.Entity.Bin;
import com.visera.backend.Entity.InventoryStock;
import com.visera.backend.Entity.Sku;
import com.visera.backend.Repository.BinRepository;
import com.visera.backend.Repository.InventoryStockRepository;
import com.visera.backend.Repository.SkuRepository;
import com.visera.backend.mapper.EntityMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkuServiceImpl implements SkuService {

    private final SkuRepository repo;
    
    @Autowired
    private InventoryStockRepository inventoryStockRepo;
    
    @Autowired
    private BinRepository binRepository;
    
    @Autowired
    private EntityMapper mapper;

    public SkuServiceImpl(SkuRepository repo) {
        this.repo = repo;
    }

    @Override
    public Sku createSku(Sku sku) {
        return repo.save(sku);
    }

    @Override
    @Transactional
    public Sku createSkuWithInventory(Sku sku, Long binId, Integer initialQuantity) {
        // Save the SKU first
        Sku createdSku = repo.save(sku);
        
        // If binId is provided, create inventory stock entry
        if (binId != null && initialQuantity != null && initialQuantity > 0) {
            Bin bin = binRepository.findById(binId)
                    .orElseThrow(() -> new RuntimeException("Bin not found with id: " + binId));
            
            // Check if inventory stock already exists for this SKU-Bin combination
            InventoryStock existingStock = inventoryStockRepo.findBySkuIdAndBinId(createdSku.getId(), bin.getId())
                    .orElse(null);
            
            if (existingStock != null) {
                // Update existing stock
                existingStock.setQuantity(existingStock.getQuantity() + initialQuantity);
                existingStock.setUpdatedAt(LocalDateTime.now());
                inventoryStockRepo.save(existingStock);
            } else {
                // Create new inventory stock entry
                InventoryStock inventoryStock = InventoryStock.builder()
                        .sku(createdSku)
                        .bin(bin)
                        .quantity(initialQuantity)
                        .updatedAt(LocalDateTime.now())
                        .build();
                inventoryStockRepo.save(inventoryStock);
            }
        }
        
        return createdSku;
    }

    @Override
    public Sku getSkuById(int id) {
        return repo.findById(Long.valueOf(id)).orElse(null);
    }

    @Override
    public List<Sku> getAllSkus() {
        return repo.findAll();
    }

    @Override
    public Sku updateSku(int id, Sku updatedSku) {
        return repo.findById(Long.valueOf(id)).map(sku -> {
            sku.setSkuCode(updatedSku.getSkuCode());
            sku.setProduct(updatedSku.getProduct());
            sku.setColor(updatedSku.getColor());
            sku.setDimensions(updatedSku.getDimensions());
            sku.setWeight(updatedSku.getWeight());
            return repo.save(sku);
        }).orElse(null);
    }

    @Override
    public void deleteSku(int id) {
        repo.deleteById(Long.valueOf(id));
    }
    
    @Override
    public List<SkuDTO> getAllSkusWithInventory() {
        List<Sku> skus = repo.findAll();
        return skus.stream().map(sku -> {
            Long skuId = sku.getId();
            
            // Get total quantity across all bins
            int totalQuantity = inventoryStockRepo.getTotalQuantityBySkuId(skuId);
            
            // Get primary bin location (first bin with stock, ordered by quantity DESC)
            List<String> binLocations = inventoryStockRepo.getBinLocationsBySkuId(skuId);
            String binLocation = binLocations.isEmpty() ? "-" : binLocations.get(0);
            
            // Calculate status (Low Stock if quantity < 50, otherwise In Stock)
            String status = totalQuantity > 0 ? (totalQuantity < 50 ? "Low Stock" : "In Stock") : "Out of Stock";
            
            // Create DTO with enriched data
            SkuDTO dto = new SkuDTO();
            dto.setId(sku.getId());
            dto.setSkuCode(sku.getSkuCode());
            dto.setColor(sku.getColor());
            dto.setDimensions(sku.getDimensions());
            dto.setWeight(sku.getWeight());
            dto.setProductId(sku.getProduct().getId());
            dto.setProductName(sku.getProduct().getName());
            dto.setTotalQuantity(totalQuantity);
            dto.setBinLocation(binLocation);
            dto.setStatus(status);
            
            return dto;
        }).collect(Collectors.toList());
    }
}

