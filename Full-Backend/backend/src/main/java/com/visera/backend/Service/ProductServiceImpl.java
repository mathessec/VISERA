package com.visera.backend.Service;


import com.visera.backend.Entity.Product;
import com.visera.backend.Repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;

    public ProductServiceImpl(ProductRepository repo) {
        this.repo = repo;
    }

    @Override
    public Product createProduct(Product product) {
        return repo.save(product);
    }

    @Override
    public Product getProductById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProducts() {
        return repo.findAll();
    }
}
