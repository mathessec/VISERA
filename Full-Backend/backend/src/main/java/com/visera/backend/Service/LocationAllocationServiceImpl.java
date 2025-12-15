package com.visera.backend.Service;

import com.visera.backend.DTOs.BinAllocation;
import com.visera.backend.DTOs.LocationAllocationResult;
import com.visera.backend.Entity.*;
import com.visera.backend.Repository.BinRepository;
import com.visera.backend.Repository.InventoryStockRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationAllocationServiceImpl implements LocationAllocationService {

    private final InventoryStockRepository inventoryStockRepository;
    private final BinRepository binRepository;

    public LocationAllocationServiceImpl(
            InventoryStockRepository inventoryStockRepository,
            BinRepository binRepository) {
        this.inventoryStockRepository = inventoryStockRepository;
        this.binRepository = binRepository;
    }

    @Override
    public Bin suggestOptimalLocation(Sku sku, Integer quantity) {
        LocationAllocationResult result = allocateLocationWithOverflow(sku, quantity);
        return result != null ? result.getPrimaryBin() : null;
    }

    @Override
    public LocationAllocationResult allocateLocationWithOverflow(Sku sku, Integer quantity) {
        // Step 1: Find SKU's assigned bin (from first InventoryStock entry)
        List<InventoryStock> existingStocks = inventoryStockRepository.findBySkuId(sku.getId());
        Bin assignedBin = null;
        InventoryStock assignedStock = null;
        Zone assignedZone = null;

        if (!existingStocks.isEmpty()) {
            assignedStock = existingStocks.get(0); // First entry is the assigned bin
            assignedBin = assignedStock.getBin();
            if (assignedBin != null && assignedBin.getRack() != null) {
                assignedZone = assignedBin.getRack().getZone();
            }
        }

        // If no assigned bin exists, find bin in zone matching product category
        if (assignedBin == null) {
            // Try to find a bin in a zone that matches the product category
            // For now, we'll use the first available zone - this can be enhanced later
            List<Bin> allBins = binRepository.findAll();
            if (!allBins.isEmpty()) {
                assignedBin = allBins.get(0);
                if (assignedBin.getRack() != null) {
                    assignedZone = assignedBin.getRack().getZone();
                }
            } else {
                return null; // No bins available
            }
        }

        if (assignedZone == null) {
            return null; // No zone found
        }

        // Step 2: Check capacity
        int currentQuantity = assignedStock != null ? assignedStock.getQuantity() : 0;
        int binCapacity = assignedBin.getCapacity() != null ? assignedBin.getCapacity() : Integer.MAX_VALUE;
        int availableCapacity = binCapacity - currentQuantity;

        List<BinAllocation> binAllocations = new ArrayList<>();

        // Step 3: Handle overflow
        if (quantity <= availableCapacity) {
            // Store all in assigned bin
            BinAllocation allocation = BinAllocation.builder()
                    .binId(assignedBin.getId())
                    .binCode(assignedBin.getCode())
                    .binName(assignedBin.getName())
                    .quantity(quantity)
                    .availableCapacity(availableCapacity)
                    .build();
            binAllocations.add(allocation);
        } else {
            // Fill assigned bin to capacity
            BinAllocation primaryAllocation = BinAllocation.builder()
                    .binId(assignedBin.getId())
                    .binCode(assignedBin.getCode())
                    .binName(assignedBin.getName())
                    .quantity(availableCapacity)
                    .availableCapacity(availableCapacity)
                    .build();
            binAllocations.add(primaryAllocation);

            // Remaining quantity
            final int remainingQuantityInitial = quantity - availableCapacity;
            int remainingQuantity = remainingQuantityInitial;

            // Step 4: Find additional bins in same zone
            List<Bin> zoneBins = binRepository.findByRackZoneId(assignedZone.getId());
            
            // Make assignedBin effectively final for lambda
            final Bin finalAssignedBin = assignedBin;
            final Long assignedBinId = finalAssignedBin.getId();
            
            // Filter and sort bins
            List<BinWithCapacity> binsWithCapacity = zoneBins.stream()
                    .filter(bin -> !bin.getId().equals(assignedBinId)) // Exclude assigned bin
                    .map(bin -> {
                        InventoryStock stock = inventoryStockRepository.findBySkuIdAndBinId(sku.getId(), bin.getId())
                                .orElse(null);
                        int currentQty = stock != null ? stock.getQuantity() : 0;
                        int capacity = bin.getCapacity() != null ? bin.getCapacity() : Integer.MAX_VALUE;
                        int available = capacity - currentQty;
                        return new BinWithCapacity(bin, available, stock != null);
                    })
                    .filter(bwc -> bwc.availableCapacity > 0) // Only bins with available capacity
                    .sorted(Comparator
                            .comparing((BinWithCapacity bwc) -> bwc.hasSameSku ? 0 : 1) // Prefer bins with same SKU
                            .thenComparing(Comparator.comparing((BinWithCapacity bwc) -> bwc.availableCapacity).reversed())) // Then by capacity
                    .collect(Collectors.toList());

            // Allocate remaining quantity
            for (BinWithCapacity bwc : binsWithCapacity) {
                if (remainingQuantity <= 0) break;

                int quantityToAllocate = Math.min(remainingQuantity, bwc.availableCapacity);
                BinAllocation allocation = BinAllocation.builder()
                        .binId(bwc.bin.getId())
                        .binCode(bwc.bin.getCode())
                        .binName(bwc.bin.getName())
                        .quantity(quantityToAllocate)
                        .availableCapacity(bwc.availableCapacity)
                        .build();
                binAllocations.add(allocation);
                remainingQuantity -= quantityToAllocate;
            }

            // If still have remaining quantity, we couldn't allocate all
            if (remainingQuantity > 0) {
                // Could throw exception or return partial allocation
                // For now, we'll return what we can allocate
            }
        }

        // Format location string
        String suggestedLocation = formatBinLocation(assignedBin, assignedZone);

        return LocationAllocationResult.builder()
                .primaryBin(assignedBin)
                .suggestedLocation(suggestedLocation)
                .binAllocations(binAllocations)
                .zoneId(assignedZone.getId())
                .zoneName(assignedZone.getName())
                .build();
    }

    private String formatBinLocation(Bin bin, Zone zone) {
        Rack rack = bin.getRack();
        String binCode = bin.getCode() != null ? bin.getCode() : bin.getName();
        String zoneName = zone.getName();
        String rackName = rack != null ? rack.getName() : "";
        
        if (rackName.isEmpty()) {
            return String.format("%s / %s", zoneName, binCode);
        }
        return String.format("%s / %s", zoneName, binCode);
    }

    // Helper class for bin capacity calculation
    private static class BinWithCapacity {
        Bin bin;
        int availableCapacity;
        boolean hasSameSku;

        BinWithCapacity(Bin bin, int availableCapacity, boolean hasSameSku) {
            this.bin = bin;
            this.availableCapacity = availableCapacity;
            this.hasSameSku = hasSameSku;
        }
    }
}
