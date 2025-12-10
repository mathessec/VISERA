package com.visera.backend.Service;


import com.visera.backend.Entity.Product;
import com.visera.backend.Repository.ProductRepository;
import com.visera.backend.Repository.SkuRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;
    private final SkuRepository skuRepository;

    public ProductServiceImpl(ProductRepository repo, SkuRepository skuRepository) {
        this.repo = repo;
        this.skuRepository = skuRepository;
    }

    @Override
    public Product createProduct(Product product) {
        return repo.save(product);
    }

    @Override
    public Product getProductById(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    @Override
    public Product updateProduct(Long id, Product updated) {
        return repo.findById(id).map(product -> {
            product.setName(updated.getName());
            product.setDescription(updated.getDescription());
            product.setCategory(updated.getCategory());
            product.setStatus(updated.getStatus());
            // Add any other fields you want to allow updating here
            return repo.save(product);
        }).orElse(null);
    }

    @Override
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    @Override
    public long getSkuCountByProductId(Long productId) {
        return skuRepository.countByProductId(productId);
    }
}
