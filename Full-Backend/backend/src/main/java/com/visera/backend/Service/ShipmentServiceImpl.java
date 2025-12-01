package com.visera.backend.Service;

import com.visera.backend.Entity.Shipment;
import com.visera.backend.Repository.ShipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository repo;

    public ShipmentServiceImpl(ShipmentRepository repo) {
        this.repo = repo;
    }

    @Override
    public Shipment createShipment(Shipment shipment) {
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
}

