package com.visera.backend.Service;

import com.visera.backend.DTOs.BinCreateDTO;
import com.visera.backend.DTOs.BinWithStatusDTO;
import com.visera.backend.Entity.Bin;
import com.visera.backend.Entity.Rack;
import com.visera.backend.Repository.BinRepository;
import com.visera.backend.Repository.RackRepository;
import com.visera.backend.Repository.InventoryStockRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BinServiceImpl implements BinService {

    private final BinRepository repo;
    private final RackRepository rackRepo;
    private final InventoryStockRepository inventoryStockRepo;

    public BinServiceImpl(BinRepository repo, RackRepository rackRepo, InventoryStockRepository inventoryStockRepo) {
        this.repo = repo;
        this.rackRepo = rackRepo;
        this.inventoryStockRepo = inventoryStockRepo;
    }

    @Override
    public Bin createBin(BinCreateDTO binCreateDTO) {
        Rack rack = rackRepo.findById(binCreateDTO.getRackId())
                .orElseThrow(() -> new RuntimeException("Rack not found with id: " + binCreateDTO.getRackId()));
        
        // Auto-generate code from name if not provided
        String code = binCreateDTO.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = binCreateDTO.getName() != null ? binCreateDTO.getName() : "BIN-" + System.currentTimeMillis(); // Use name as code if not provided
        }
        
        Bin bin = Bin.builder()
                .rack(rack)
                .name(binCreateDTO.getName())
                .code(code)
                .capacity(binCreateDTO.getCapacity())
                .build();
        
        return repo.save(bin);
    }

    @Override
    public List<Bin> getBinsByRack(Long rackId) {
        return repo.findByRackId(rackId);
    }

    @Override
    public List<BinWithStatusDTO> getBinsWithStatusByRack(Long rackId) {
        List<Bin> bins = repo.findByRackId(rackId);
        
        return bins.stream().map(bin -> {
            BinWithStatusDTO dto = new BinWithStatusDTO();
            dto.setId(bin.getId());
            dto.setName(bin.getName());
            dto.setCode(bin.getCode());
            dto.setCapacity(bin.getCapacity());
            dto.setRackId(bin.getRack() != null ? bin.getRack().getId() : null);
            dto.setRackName(bin.getRack() != null ? bin.getRack().getName() : null);
            
            // Check if bin is occupied by checking inventory_stock
            List<com.visera.backend.Entity.InventoryStock> stocks = inventoryStockRepo.findByBinId(bin.getId());
            int totalQuantity = stocks.stream()
                    .mapToInt(com.visera.backend.Entity.InventoryStock::getQuantity)
                    .sum();
            
            dto.setCurrentQuantity(totalQuantity);
            dto.setIsOccupied(totalQuantity > 0);
            
            return dto;
        }).collect(Collectors.toList());
    }
}

