package com.visera.backend.Controller;

import com.visera.backend.Entity.Rack;
import com.visera.backend.Service.RackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/racks")
@CrossOrigin(origins = "*")
public class RackController {

    private final RackService rackService;

    public RackController(RackService rackService) {
        this.rackService = rackService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<Rack> create(@RequestBody Rack rack) {
        return ResponseEntity.ok(rackService.createRack(rack));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<Rack>> getByZone(@PathVariable int zoneId) {
        return ResponseEntity.ok(rackService.getRacksByZone(zoneId));
    }
}
