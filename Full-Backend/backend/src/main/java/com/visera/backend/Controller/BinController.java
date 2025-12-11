package com.visera.backend.Controller;

import com.visera.backend.DTOs.BinCreateDTO;
import com.visera.backend.DTOs.BinWithStatusDTO;
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
    public ResponseEntity<Bin> create(@Valid @RequestBody BinCreateDTO binCreateDTO) {
        return ResponseEntity.ok(binService.createBin(binCreateDTO));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/rack/{rackId}")
    public ResponseEntity<List<Bin>> getByRack(@PathVariable Long rackId) {
        return ResponseEntity.ok(binService.getBinsByRack(rackId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/rack/{rackId}/with-status")
    public ResponseEntity<List<BinWithStatusDTO>> getBinsWithStatusByRack(@PathVariable Long rackId) {
        return ResponseEntity.ok(binService.getBinsWithStatusByRack(rackId));
    }
}

