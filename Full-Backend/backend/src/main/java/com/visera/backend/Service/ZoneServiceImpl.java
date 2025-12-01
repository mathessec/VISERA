package com.visera.backend.Service;

import com.visera.backend.Entity.Zone;
import com.visera.backend.Repository.ZoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository repo;

    public ZoneServiceImpl(ZoneRepository repo) {
        this.repo = repo;
    }

    @Override
    public Zone createZone(Zone zone) {
        return repo.save(zone);
    }

    @Override
    public List<Zone> getAllZones() {
        return repo.findAll();
    }

    @Override
    public void deleteZone(int zoneId) {
        repo.deleteById(zoneId);
    }
}

