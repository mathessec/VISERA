package com.visera.backend.Controller;

import com.visera.backend.DTOs.ProductDTO;
import com.visera.backend.Entity.Product;
import com.visera.backend.Service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create product
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/create")
    public ResponseEntity<Product> create(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

//    // Get all
//    @GetMapping
//    public ResponseEntity<List<Product>> getAll() {
//        return ResponseEntity.ok(productService.getAllProducts());
//    }

    // Get by id
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable int id) {
        Product p = productService.getProductById(id);
        return (p != null) ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    // Fot DTO
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    @GetMapping("/getallproducts")
    public ResponseEntity<List<ProductDTO>> getAll() {
        return ResponseEntity.ok(
                productService.getAllProducts().stream()
                        .map(product -> {
                            ProductDTO dto = new ProductDTO();
                            dto.setId(product.getId());
                            dto.setName(product.getName());
                            dto.setDescription(product.getDescription());
                            dto.setCategory(product.getCategory());
                            dto.setImageUrl(product.getImageUrl());
                            return dto;
                        }).toList()
        );
    }

}
