package com.visera.backend.DTOs;

import com.visera.backend.Entity.Bin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationAllocationResult {
    private Bin primaryBin; // main suggested bin
    private String suggestedLocation; // formatted location string
    private List<BinAllocation> binAllocations; // list of bins with quantities
    private Long zoneId;
    private String zoneName;
}
