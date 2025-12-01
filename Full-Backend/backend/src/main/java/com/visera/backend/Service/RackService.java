package com.visera.backend.Service;

import com.visera.backend.Entity.Rack;

import java.util.List;

public interface RackService {
    Rack createRack(Rack rack);
    List<Rack> getRacksByZone(int zoneId);
}

