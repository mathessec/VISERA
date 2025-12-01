package com.visera.backend.Service;
import com.visera.backend.Entity.Zone;
import java.util.List;

public interface ZoneService {
    Zone createZone(Zone zone);
    List<Zone> getAllZones();

    void deleteZone(int zoneId);
}
