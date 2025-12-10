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

    @Override
    public Product updateProduct(int id, Product updated) {
        return repo.findById(id).map(product -> {
            product.setName(updated.getName());
            product.setDescription(updated.getDescription());
            product.setCategory(updated.getCategory());
            product.setImageUrl(updated.getImageUrl());
            // Add any other fields you want to allow updating here
            return repo.save(product);
        }).orElse(null);
    }

    @Override
    public void deleteProduct(int id) {
        repo.deleteById(id);
    }
}
