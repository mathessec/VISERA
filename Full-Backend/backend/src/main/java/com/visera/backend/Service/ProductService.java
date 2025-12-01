package com.visera.backend.Service;

import com.visera.backend.Entity.Product;

import java.util.List;

public interface ProductService {
    Product createProduct(Product product);
    Product getProductById(int id);
    List<Product> getAllProducts();
}

