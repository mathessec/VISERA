package com.visera.backend.Controller;

import com.visera.backend.Entity.InventoryStock;
import com.visera.backend.Service.InventoryStockService;
import com.visera.backend.DTOs.InventoryStockRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryStockController {

    private final InventoryStockService inventoryStockService;

    public InventoryStockController(InventoryStockService inventoryStockService) {
        this.inventoryStockService = inventoryStockService;
    }

    // Create or update stock using JSON Body
//    @PostMapping("/create")
//    public ResponseEntity<InventoryStock> createOrUpdateStock(
//            @RequestBody InventoryStockRequest request
//    ) {
//        InventoryStock stock = inventoryStockService.updateStock(
//                request.getSkuId(),
//                request.getBinId(),
//                request.getQuantity()
//        );
//        return ResponseEntity.ok(stock);
//    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<InventoryStock> createStock(
            @RequestBody InventoryStock request)
    {
        return ResponseEntity.ok(inventoryStockService.createStock(request));
    }


    // Get stock for specific SKU + Bin
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/get/{skuId}/{binId}")
    public ResponseEntity<InventoryStock> getStock(
            @RequestParam int skuId,
            @RequestParam int binId
    ) {
        return ResponseEntity.ok(
                inventoryStockService.getStock(skuId, binId)
        );
    }

    // Get all stock (optional useful API)
//    @GetMapping("/all")
//    public ResponseEntity<List<InventoryStock>> getAllStock() {
//        return ResponseEntity.ok(inventoryStockService.getAllStock());
//    }
}
