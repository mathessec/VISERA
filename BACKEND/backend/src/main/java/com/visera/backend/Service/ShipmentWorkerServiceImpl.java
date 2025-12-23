package com.visera.backend.Service;

import com.visera.backend.DTOs.UserDTO;
import com.visera.backend.Entity.Shipment;
import com.visera.backend.Entity.ShipmentWorker;
import com.visera.backend.Entity.User;
import com.visera.backend.Repository.ShipmentRepository;
import com.visera.backend.Repository.ShipmentWorkerRepository;
import com.visera.backend.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentWorkerServiceImpl implements ShipmentWorkerService {

    private final ShipmentWorkerRepository shipmentWorkerRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public ShipmentWorkerServiceImpl(
            ShipmentWorkerRepository shipmentWorkerRepository,
            ShipmentRepository shipmentRepository,
            UserRepository userRepository) {
        this.shipmentWorkerRepository = shipmentWorkerRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void assignWorkers(int shipmentId, List<Integer> workerIds) {
        Shipment shipment = shipmentRepository.findById((long) shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + shipmentId));

        for (Integer workerId : workerIds) {
            User worker = userRepository.findById(workerId.longValue())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + workerId));

            // Check if already assigned
            boolean alreadyAssigned = shipmentWorkerRepository.findByShipment(shipment).stream()
                    .anyMatch(sw -> sw.getWorker().getId().equals(worker.getId()));

            if (!alreadyAssigned) {
                ShipmentWorker shipmentWorker = ShipmentWorker.builder()
                        .shipment(shipment)
                        .worker(worker)
                        .build();
                shipmentWorkerRepository.save(shipmentWorker);
            }
        }
    }

    @Override
    @Transactional
    public void removeWorker(int shipmentId, int workerId) {
        Shipment shipment = shipmentRepository.findById((long) shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + shipmentId));

        User worker = userRepository.findById((long) workerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + workerId));

        // Find the specific ShipmentWorker entity
        List<ShipmentWorker> existingAssignments = shipmentWorkerRepository.findByShipment(shipment);
        ShipmentWorker assignmentToDelete = existingAssignments.stream()
                .filter(sw -> sw.getWorker().getId().equals(worker.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Worker is not assigned to this shipment"));

        // Delete by ID for better error handling
        shipmentWorkerRepository.deleteById(assignmentToDelete.getId());
    }

    @Override
    public List<UserDTO> getAssignedWorkers(int shipmentId) {
        Shipment shipment = shipmentRepository.findById((long) shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + shipmentId));

        return shipmentWorkerRepository.findByShipment(shipment).stream()
                .map(sw -> {
                    UserDTO userDTO = new UserDTO();
                    userDTO.setId(sw.getWorker().getId());
                    userDTO.setName(sw.getWorker().getName());
                    userDTO.setEmail(sw.getWorker().getEmail());
                    userDTO.setRole(sw.getWorker().getRole());
                    return userDTO;
                })
                .collect(Collectors.toList());
    }
}

