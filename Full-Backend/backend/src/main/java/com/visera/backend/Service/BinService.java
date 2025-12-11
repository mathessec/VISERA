package com.visera.backend.Service;

import com.visera.backend.DTOs.BinCreateDTO;
import com.visera.backend.DTOs.BinWithStatusDTO;
import com.visera.backend.Entity.Bin;

import java.util.List;

public interface BinService {
    Bin createBin(BinCreateDTO binCreateDTO);
    List<Bin> getBinsByRack(Long rackId);
    List<BinWithStatusDTO> getBinsWithStatusByRack(Long rackId);
}

