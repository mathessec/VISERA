package com.visera.backend.Controller;

import com.visera.backend.Entity.Bin;
import com.visera.backend.Service.BinService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bins")
@CrossOrigin(origins = "*")
public class BinController {

    private final BinService binService;

    public BinController(BinService binService) {
        this.binService = binService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<Bin> create(@Valid @RequestBody Bin bin) {
        return ResponseEntity.ok(binService.createBin(bin));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/rack/{rackId}")
    public ResponseEntity<List<Bin>> getByRack(@PathVariable Long rackId) {
        return ResponseEntity.ok(binService.getBinsByRack(rackId));
    }
}

