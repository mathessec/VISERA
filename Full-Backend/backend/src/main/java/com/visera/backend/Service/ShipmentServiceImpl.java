package com.visera.backend.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.visera.backend.Entity.Shipment;
import com.visera.backend.Entity.User;
import com.visera.backend.Repository.ShipmentRepository;
import com.visera.backend.Repository.ShipmentItemRepository;
import com.visera.backend.Repository.UserRepository;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository repo;
    private final UserRepository userRepository;
    private final ShipmentItemRepository shipmentItemRepository;

    public ShipmentServiceImpl(
            ShipmentRepository repo,
            UserRepository userRepository,
            ShipmentItemRepository shipmentItemRepository) {

        this.repo = repo;
        this.userRepository = userRepository;
        this.shipmentItemRepository = shipmentItemRepository;
    }

    @Override
    public Shipment createShipment(Shipment shipment) {

        if (shipment.getCreatedBy() != null && shipment.getCreatedBy().getId() != null) {
            User user = userRepository.findById(shipment.getCreatedBy().getId())
                    .orElseThrow(() ->
                            new RuntimeException("User not found with id: " + shipment.getCreatedBy().getId()));
            shipment.setCreatedBy(user);
        }

        return repo.save(shipment);
    }

    @Override
    public Shipment getShipmentById(int id) {
        return repo.findById((long) id).orElse(null);
    }

    @Override
    public List<Shipment> getAllShipments() {
        return repo.findAll();
    }

    @Override
    public Shipment updateShipment(int id, Shipment updated) {
        return repo.findById((long) id).map(shipment -> {

            shipment.setShipmentType(updated.getShipmentType());
            shipment.setStatus(updated.getStatus());
            shipment.setCreatedBy(updated.getCreatedBy());
            shipment.setAssignedTo(updated.getAssignedTo());

            if (updated.getDeadline() != null) {
                shipment.setDeadline(updated.getDeadline());
            }

            return repo.save(shipment);

        }).orElse(null);
    }

    @Override
    @Transactional
    public void deleteShipment(int id) {

        Shipment shipment = repo.findById((long) id)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found with id: " + id));

        shipmentItemRepository.findByShipmentId((long) id)
                .forEach(item -> shipmentItemRepository.deleteById(item.getId()));

        repo.deleteById((long) id);
    }

    @Override
    public Shipment assignShipment(int shipmentId, int userId) {

        Shipment shipment = repo.findById((long) shipmentId).orElse(null);
        if (shipment == null) return null;

        User user = userRepository.findById((long) userId).orElse(null);
        if (user == null) return null;

        shipment.setAssignedTo(user);
        return repo.save(shipment);
    }

    // =========================
    // ✅ AGENTIC CHAT METHODS
    // =========================

    @Override
    public long countTodayShipments(Long workerId) {

        LocalDateTime start =
                LocalDate.now().atStartOfDay();
        LocalDateTime end =
                LocalDate.now().atTime(23, 59, 59);

        return repo.countTodayShipmentsByWorker(workerId, start, end);
    }

    @Override
    public long countFailedVerifications(Long workerId) {

        return shipmentItemRepository
                .countFailedVerificationsByWorker(workerId);
    }
}
