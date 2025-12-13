package com.visera.backend.Controller;

import com.visera.backend.DTOs.ReportDTO;
import com.visera.backend.Repository.ShipmentRepository;
import com.visera.backend.Repository.SkuRepository;
import com.visera.backend.Repository.UserRepository;
import com.visera.backend.Repository.VerificationLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final SkuRepository skuRepository;
    private final VerificationLogRepository verificationLogRepository;

    public ReportController(
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            SkuRepository skuRepository,
            VerificationLogRepository verificationLogRepository) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.skuRepository = skuRepository;
        this.verificationLogRepository = verificationLogRepository;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping("/analytics")
    public ResponseEntity<ReportDTO> getAnalytics() {
        // Get current year for monthly data
        int currentYear = LocalDateTime.now().getYear();

        // Build shipment trends for last 6 months
        List<ReportDTO.MonthlyShipmentData> shipmentTrends = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);

            String monthName = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            long inbound = shipmentRepository.countByShipmentTypeAndCreatedAtBetween("INBOUND", monthStart, monthEnd);
            long outbound = shipmentRepository.countByShipmentTypeAndCreatedAtBetween("OUTBOUND", monthStart, monthEnd);

            shipmentTrends.add(ReportDTO.MonthlyShipmentData.builder()
                    .month(monthName)
                    .inbound(inbound)
                    .outbound(outbound)
                    .build());
        }

        // Build role distribution
        List<ReportDTO.RoleDistribution> roleDistribution = new ArrayList<>();
        long adminCount = userRepository.countByRole("ADMIN");
        long supervisorCount = userRepository.countByRole("SUPERVISOR");
        long workerCount = userRepository.countByRole("WORKER");

        roleDistribution.add(ReportDTO.RoleDistribution.builder().name("Workers").value(workerCount).build());
        roleDistribution.add(ReportDTO.RoleDistribution.builder().name("Supervisors").value(supervisorCount).build());
        roleDistribution.add(ReportDTO.RoleDistribution.builder().name("Admins").value(adminCount).build());

        // Get summary statistics
        long totalShipments = shipmentRepository.count();
        long totalMismatches = verificationLogRepository.countByResult("MISMATCH");
        long totalUsers = userRepository.count();
        long totalSkus = skuRepository.count();

        ReportDTO report = ReportDTO.builder()
                .totalShipments(totalShipments)
                .totalMismatches(totalMismatches)
                .totalUsers(totalUsers)
                .totalSkus(totalSkus)
                .shipmentTrends(shipmentTrends)
                .roleDistribution(roleDistribution)
                .build();

        return ResponseEntity.ok(report);
    }
}
