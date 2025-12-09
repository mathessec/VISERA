package com.visera.backend.Controller;

import com.visera.backend.DTOs.SkuDTO;
import com.visera.backend.Entity.Sku;
import com.visera.backend.Service.SkuService;
import com.visera.backend.mapper.EntityMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skus")
@CrossOrigin(origins = "*")
public class SkuController {

    @Autowired
    EntityMapper mapper;

    private final SkuService skuService;

    public SkuController(SkuService skuService) {
        this.skuService = skuService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<Sku> create(@RequestBody Sku sku) {
        return ResponseEntity.ok(skuService.createSku(sku));
    }

//    @GetMapping("/getallsku")
//    public ResponseEntity<List<Sku>> getAll() {
//        return ResponseEntity.ok(skuService.getAllSkus());
//    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','WORKER')")
    @GetMapping("/getbyid/{id}")
    public ResponseEntity<Sku> getById(@PathVariable int id) {
        Sku sku = skuService.getSkuById(id);
        return (sku != null) ? ResponseEntity.ok(sku) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Sku> update(@PathVariable int id, @RequestBody Sku updated) {
        Sku sku = skuService.updateSku(id, updated);
        return (sku != null) ? ResponseEntity.ok(sku) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        skuService.deleteSku(id);
        return ResponseEntity.noContent().build();
    }

    //DTO
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','WORKER')")
    @GetMapping("/getallskudto")
    public ResponseEntity<List<SkuDTO>> getAllSkus() {
        return ResponseEntity.ok(
                skuService.getAllSkus().stream()
                        .map(mapper::toSkuDTO)
                        .collect(java.util.stream.Collectors.toList())
        );
    }
}

