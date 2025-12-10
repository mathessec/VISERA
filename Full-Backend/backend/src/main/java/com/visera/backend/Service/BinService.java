package com.visera.backend.Service;

import com.visera.backend.Entity.Bin;

import java.util.List;

public interface BinService {
    Bin createBin(Bin bin);
    List<Bin> getBinsByRack(Long rackId);
}

