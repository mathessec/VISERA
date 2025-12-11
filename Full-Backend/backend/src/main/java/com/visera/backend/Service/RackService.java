package com.visera.backend.Service;

import com.visera.backend.DTOs.RackCreateDTO;
import com.visera.backend.DTOs.RackWithBinsDTO;
import com.visera.backend.Entity.Rack;

import java.util.List;

public interface RackService {
    Rack createRack(RackCreateDTO rackCreateDTO);
    List<Rack> getRacksByZone(Long zoneId);
    List<RackWithBinsDTO> getRacksWithBinsByZone(Long zoneId);
}

