package com.visera.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.visera.backend.Entity.Shipment;
import com.visera.backend.Entity.User;
import com.visera.backend.Repository.ShipmentRepository;
import com.visera.backend.Repository.UserRepository;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository repo;
    private final UserRepository userRepository;

    public ShipmentServiceImpl(ShipmentRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    @Override
    public Shipment createShipment(Shipment shipment) {
        // Ensure createdBy user is properly loaded from database
        if (shipment.getCreatedBy() != null && shipment.getCreatedBy().getId() != null) {
            User user = userRepository.findById(shipment.getCreatedBy().getId().intValue())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + shipment.getCreatedBy().getId()));
            shipment.setCreatedBy(user);
        }
        return repo.save(shipment);
    }

    @Override
    public Shipment getShipmentById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Shipment> getAllShipments() {
        return repo.findAll();
    }

    @Override
    public Shipment updateShipment(int id, Shipment updated) {
        return repo.findById(id).map(shipment -> {
            shipment.setShipmentType(updated.getShipmentType());
            shipment.setStatus(updated.getStatus());
            shipment.setCreatedBy(updated.getCreatedBy());
            shipment.setAssignedTo(updated.getAssignedTo());
            return repo.save(shipment);
        }).orElse(null);
    }

    @Override
    public void deleteShipment(int id) {
        repo.deleteById(id);
    }

    @Override
    public Shipment assignShipment(int shipmentId, int userId) {
        Shipment shipment = repo.findById(shipmentId).orElse(null);
        if (shipment == null) {
            return null;
        }
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        
        shipment.setAssignedTo(user);
        return repo.save(shipment);
    }
}

