package com.visera.backend.Service;

import com.visera.backend.Entity.Bin;
import com.visera.backend.Repository.BinRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BinServiceImpl implements BinService {

    private final BinRepository repo;

    public BinServiceImpl(BinRepository repo) {
        this.repo = repo;
    }

    @Override
    public Bin createBin(Bin bin) {
        return repo.save(bin);
    }

    @Override
    public List<Bin> getBinsByRack(Long rackId) {
        return repo.findByRackId(rackId);
    }
}

