package com.visera.backend.Controller;

import com.visera.backend.DTOs.VerificationDTO;
import com.visera.backend.Entity.VerificationLog;
import com.visera.backend.Service.VerificationLogService;
import com.visera.backend.mapper.EntityMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/verification-logs")
@CrossOrigin(origins = "*")
public class VerificationLogController {

    @Autowired
    EntityMapper mapper;

    private final VerificationLogService verificationLogService;

    public VerificationLogController(VerificationLogService verificationLogService) {
        this.verificationLogService = verificationLogService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<VerificationLog> create(@RequestBody VerificationLog log) {
        return ResponseEntity.ok(verificationLogService.createLog(log));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/shipment/{shipmentItemId}")
    public ResponseEntity<List<VerificationLog>> getByShipmentItem(@PathVariable int shipmentItemId) {
        return ResponseEntity.ok(verificationLogService.getLogsByShipmentItem(shipmentItemId));
    }

    //DTO
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/shipment-item/{itemId}")
    public ResponseEntity<List<VerificationDTO>> getLogs(@PathVariable int itemId) {
        return ResponseEntity.ok(
                verificationLogService.getLogsByShipmentItem(itemId).stream()
                        .map(mapper::toVerificationDTO).toList()
        );
    }

}
