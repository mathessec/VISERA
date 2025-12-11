package com.visera.backend.Service;

import com.visera.backend.DTOs.RackCreateDTO;
import com.visera.backend.DTOs.RackWithBinsDTO;
import com.visera.backend.Entity.Rack;
import com.visera.backend.Entity.Zone;
import com.visera.backend.Repository.RackRepository;
import com.visera.backend.Repository.ZoneRepository;
import com.visera.backend.Repository.BinRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RackServiceImpl implements RackService {

    private final RackRepository repo;
    private final ZoneRepository zoneRepo;
    private final BinRepository binRepo;

    public RackServiceImpl(RackRepository repo, ZoneRepository zoneRepo, BinRepository binRepo) {
        this.repo = repo;
        this.zoneRepo = zoneRepo;
        this.binRepo = binRepo;
    }

    @Override
    public Rack createRack(RackCreateDTO rackCreateDTO) {
        Zone zone = zoneRepo.findById(rackCreateDTO.getZoneId())
                .orElseThrow(() -> new RuntimeException("Zone not found with id: " + rackCreateDTO.getZoneId()));
        
        Rack rack = Rack.builder()
                .zone(zone)
                .name(rackCreateDTO.getName())
                .description(rackCreateDTO.getDescription())
                .build();
        
        return repo.save(rack);
    }

    @Override
    public List<Rack> getRacksByZone(Long zoneId) {
        return repo.findByZoneId(zoneId);
    }

    @Override
    public List<RackWithBinsDTO> getRacksWithBinsByZone(Long zoneId) {
        List<Rack> racks = repo.findByZoneId(zoneId);
        
        return racks.stream().map(rack -> {
            RackWithBinsDTO dto = new RackWithBinsDTO();
            dto.setId(rack.getId());
            dto.setName(rack.getName());
            dto.setDescription(rack.getDescription());
            dto.setZoneId(rack.getZone().getId());
            dto.setZoneName(rack.getZone().getName());
            
            long binCount = binRepo.findByRackId(rack.getId()).size();
            dto.setBinCount(binCount);
            
            return dto;
        }).collect(Collectors.toList());
    }
}

