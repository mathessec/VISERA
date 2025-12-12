package com.visera.backend.Service;

import com.visera.backend.DTOs.BinCreateDTO;
import com.visera.backend.DTOs.BinUpdateDTO;
import com.visera.backend.DTOs.BinWithStatusDTO;
import com.visera.backend.Entity.Bin;

import java.util.List;

public interface BinService {
    Bin createBin(BinCreateDTO binCreateDTO);
    Bin updateBin(Long binId, BinUpdateDTO binUpdateDTO);
    void deleteBin(Long binId);
    List<Bin> getBinsByRack(int rackId);
    List<BinWithStatusDTO> getBinsWithStatusByRack(int rackId);
}

