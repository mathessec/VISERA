package com.visera.backend.Service;

import com.visera.backend.Entity.VerificationLog;
import com.visera.backend.Repository.VerificationLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VerificationLogServiceImpl implements VerificationLogService {

    private final VerificationLogRepository repo;

    public VerificationLogServiceImpl(VerificationLogRepository repo) {
        this.repo = repo;
    }

    @Override
    public VerificationLog createLog(VerificationLog log) {
        return repo.save(log);
    }

    @Override
    public List<VerificationLog> getLogsByShipmentItem(int itemId) {
        return repo.findByShipmentItemId(itemId);
    }
}

