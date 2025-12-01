package com.visera.backend.Service;

import com.visera.backend.Entity.VerificationLog;

import java.util.List;

public interface VerificationLogService {
    VerificationLog createLog(VerificationLog log);
    List<VerificationLog> getLogsByShipmentItem(int shipmentItemId);
}
