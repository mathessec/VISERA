package com.visera.backend.Controller;

import com.visera.backend.DTOs.ShipmentItemDTO;
import com.visera.backend.Entity.ShipmentItem;
import com.visera.backend.Service.ShipmentItemService;
import com.visera.backend.mapper.EntityMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipment-items")
@CrossOrigin(origins = "*")
public class ShipmentItemController {

    @Autowired
    EntityMapper mapper;

    private final ShipmentItemService shipmentItemService;

    public ShipmentItemController(ShipmentItemService shipmentItemService) {
        this.shipmentItemService = shipmentItemService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<ShipmentItem> create(@RequestBody ShipmentItem item) {
        return ResponseEntity.ok(shipmentItemService.createShipmentItem(item));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','WORKER')")
    @GetMapping("/getbyid/{id}")
    public ResponseEntity<ShipmentItem> getById(@PathVariable int id) {
        ShipmentItem item = shipmentItemService.getShipmentItemById(id);
        return (item != null) ? ResponseEntity.ok(item) : ResponseEntity.notFound().build();
    }
//
//    @GetMapping("/shipment/{shipmentId}")
//    public ResponseEntity<List<ShipmentItem>> getByShipment(@PathVariable int shipmentId) {
//        return ResponseEntity.ok(shipmentItemService.getItemsByShipment(shipmentId));
//    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    @PutMapping("/update/{id}")
    public ResponseEntity<ShipmentItem> update(@PathVariable int id, @RequestBody ShipmentItem updated) {
        ShipmentItem item = shipmentItemService.updateShipmentItem(id, updated);
        return (item != null) ? ResponseEntity.ok(item) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        shipmentItemService.deleteShipmentItem(id);
        return ResponseEntity.noContent().build();
    }

    //DTO
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','WORKER')")
    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<List<ShipmentItemDTO>> getItems(@PathVariable int shipmentId) {
        return ResponseEntity.ok(
                shipmentItemService.getItemsByShipment(shipmentId).stream()
                        .map(mapper::toShipmentItemDTO)
                        .collect(java.util.stream.Collectors.toList())

        );
    }

}

