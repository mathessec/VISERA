package com.visera.backend.Service;

import com.visera.backend.Entity.Rack;
import com.visera.backend.Repository.RackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RackServiceImpl implements RackService {

    private final RackRepository repo;

    public RackServiceImpl(RackRepository repo) {
        this.repo = repo;
    }

    @Override
    public Rack createRack(Rack rack) {
        return repo.save(rack);
    }

    @Override
    public List<Rack> getRacksByZone(int zoneId) {
        return repo.findByZoneId(zoneId);
    }
}

