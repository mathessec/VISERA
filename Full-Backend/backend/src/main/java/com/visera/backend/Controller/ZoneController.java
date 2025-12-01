package com.visera.backend.Controller;

import com.visera.backend.Entity.Zone;
import com.visera.backend.Service.ZoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@CrossOrigin(origins = "*")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Zone> create(@RequestBody Zone zone) {
        return ResponseEntity.ok(zoneService.createZone(zone));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/all")
    public ResponseEntity<List<Zone>> getAll() {
        return ResponseEntity.ok(zoneService.getAllZones());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{zoneId}")
    public ResponseEntity<Void> deleteZone(@PathVariable int zoneId) {
        zoneService.deleteZone(zoneId);
        return ResponseEntity.noContent().build();
    }
}

