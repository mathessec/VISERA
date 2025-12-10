package com.visera.backend.Service;

import com.visera.backend.DTOs.ZoneStatisticsDTO;
import com.visera.backend.DTOs.ZoneUpdateDTO;
import com.visera.backend.Entity.Zone;
import com.visera.backend.Repository.ZoneRepository;
import com.visera.backend.Repository.RackRepository;
import com.visera.backend.Repository.BinRepository;
import com.visera.backend.Repository.InventoryStockRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepo;
    private final RackRepository rackRepo;
    private final BinRepository binRepo;
    private final InventoryStockRepository inventoryStockRepo;

    public ZoneServiceImpl(ZoneRepository zoneRepo,
                           RackRepository rackRepo,
                           BinRepository binRepo,
                           InventoryStockRepository inventoryStockRepo) {
        this.zoneRepo = zoneRepo;
        this.rackRepo = rackRepo;
        this.binRepo = binRepo;
        this.inventoryStockRepo = inventoryStockRepo;
    }

    @Override
    public Zone createZone(Zone zone) {
        return zoneRepo.save(zone);
    }

    @Override
    public List<Zone> getAllZones() {
        return zoneRepo.findAll();
    }

    @Override
    public Zone getZoneById(Long zoneId) {
        return zoneRepo.findById(zoneId).orElse(null);
    }

    @Override
    public Zone updateZone(Long zoneId, ZoneUpdateDTO zoneUpdateDTO) {
        Zone existingZone = zoneRepo.findById(zoneId).orElse(null);
        if (existingZone == null) return null;
        
        if (zoneUpdateDTO.getName() != null && !zoneUpdateDTO.getName().isEmpty()) {
            existingZone.setName(zoneUpdateDTO.getName());
        }
        if (zoneUpdateDTO.getDescription() != null) {
            existingZone.setDescription(zoneUpdateDTO.getDescription());
        }
        return zoneRepo.save(existingZone);
    }

    @Override
    public void deleteZone(Long zoneId) {
        zoneRepo.deleteById(zoneId);
    }

    @Override
    public List<ZoneStatisticsDTO> getAllZoneStatistics() {
        List<Zone> zones = zoneRepo.findAll();
        
        return zones.stream().map(zone -> {
            ZoneStatisticsDTO dto = new ZoneStatisticsDTO();
            dto.setZoneId(zone.getId());
            dto.setZoneName(zone.getName());
            dto.setDescription(zone.getDescription());
            
            // Get all racks for this zone
            List<com.visera.backend.Entity.Rack> racks = rackRepo.findByZoneId(zone.getId());
            dto.setTotalRacks(racks.size());
            
            // Get all bins for racks in this zone
            List<Long> rackIds = racks.stream()
                    .map(com.visera.backend.Entity.Rack::getId)
                    .collect(Collectors.toList());
            
            long totalBins = 0;
            List<Long> binIds = new java.util.ArrayList<>();
            
            for (Long rackId : rackIds) {
                List<com.visera.backend.Entity.Bin> bins = binRepo.findByRackId(rackId);
                totalBins += bins.size();
                binIds.addAll(bins.stream()
                        .map(com.visera.backend.Entity.Bin::getId)
                        .collect(Collectors.toList()));
            }
            
            dto.setTotalBins(totalBins);
            
            // Count occupied bins (bins with quantity > 0 in inventory_stock)
            long occupiedBins = 0;
            if (!binIds.isEmpty()) {
                occupiedBins = inventoryStockRepo.countByBinIdInAndQuantityGreaterThan(binIds, 0);
            }
            
            dto.setOccupiedBins(occupiedBins);
            
            // Calculate occupancy percentage
            double occupancyPercentage = totalBins > 0 
                ? (occupiedBins * 100.0) / totalBins 
                : 0.0;
            dto.setOccupancyPercentage(Math.round(occupancyPercentage * 10.0) / 10.0);
            
            return dto;
        }).collect(Collectors.toList());
    }
}

