package com.visera.backend.Controller;

import com.visera.backend.DTOs.ShipmentDTO;
import com.visera.backend.Entity.Shipment;
import com.visera.backend.Service.ShipmentService;
import com.visera.backend.mapper.EntityMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "*")
public class ShipmentController {

    @Autowired
    EntityMapper mapper;
    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<Shipment> create(@RequestBody Shipment shipment) {
        return ResponseEntity.ok(shipmentService.createShipment(shipment));
    }

//    //getter mapper
//    @GetMapping("getter-mapper")
//    public ResponseEntity<List<Shipment>> getAll() {
//        return ResponseEntity.ok(shipmentService.getAllShipments());
//    }
//
//    @GetMapping("/getbyid/{id}")
//    public ResponseEntity<Shipment> getById(@PathVariable int id) {
//        Shipment s = shipmentService.getShipmentById(id);
//        return (s != null) ? ResponseEntity.ok(s) : ResponseEntity.notFound().build();
//    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<Shipment> update(@PathVariable int id, @RequestBody Shipment updated) {
        Shipment s = shipmentService.updateShipment(id, updated);
        return (s != null) ? ResponseEntity.ok(s) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping
    public ResponseEntity<List<ShipmentDTO>> getAllShipments() {
        return ResponseEntity.ok(
                shipmentService.getAllShipments().stream()
                        .map(mapper::toShipmentDTO).collect(java.util.stream.Collectors.toList())

        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO> getById(@PathVariable int id) {
        Shipment s = shipmentService.getShipmentById(id);

        return (s != null)
                ? ResponseEntity.ok(mapper.toShipmentDTO(s))
                : ResponseEntity.notFound().build();
    }

}
