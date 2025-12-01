package com.visera.backend.Service;
import com.visera.backend.Entity.Sku;
import com.visera.backend.Repository.SkuRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkuServiceImpl implements SkuService {

    private final SkuRepository repo;

    public SkuServiceImpl(SkuRepository repo) {
        this.repo = repo;
    }

    @Override
    public Sku createSku(Sku sku) {
        return repo.save(sku);
    }

    @Override
    public Sku getSkuById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Sku> getAllSkus() {
        return repo.findAll();
    }

    @Override
    public Sku updateSku(int id, Sku updatedSku) {
        return repo.findById(id).map(sku -> {
            sku.setSkuCode(updatedSku.getSkuCode());
            sku.setProduct(updatedSku.getProduct());
            sku.setColor(updatedSku.getColor());
            sku.setDimensions(updatedSku.getDimensions());
            sku.setWeight(updatedSku.getWeight());
            return repo.save(sku);
        }).orElse(null);
    }

    @Override
    public void deleteSku(int id) {
        repo.deleteById(id);
    }
}

