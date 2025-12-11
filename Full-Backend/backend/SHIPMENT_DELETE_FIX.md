# Shipment Delete Foreign Key Constraint Fix

## Problem Description

When trying to delete a shipment, you encountered this error:
```
Cannot delete or update a parent row: a foreign key constraint fails 
(`visera_db`.`shipment_workers`, CONSTRAINT `FK6mc9pdb2vi7vo65icsy1yfsou` 
FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`))
```

## Root Cause Analysis

### 1. **Missing JPA Cascade Configuration**
The `ShipmentWorker` entity had a `@ManyToOne` relationship to `Shipment` without any cascade configuration:
```java
@ManyToOne  // Missing cascade!
@JoinColumn(name = "shipment_id")
private Shipment shipment;
```

### 2. **Database Constraint Without CASCADE**
The database foreign key constraint was created by Hibernate auto-generation (not the migration script), so it did NOT have `ON DELETE CASCADE`.

Your migration scripts had the correct definition:
```sql
FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
```

But the actual database table was created differently.

### 3. **Transaction Flush Issue**
The `ShipmentServiceImpl.deleteShipment()` method tried to manually delete related records:
```java
shipmentWorkerRepository.deleteByShipment(shipment);  // Not flushed to DB
repo.deleteById(id);  // Executes before the above deletion
```

The manual deletion wasn't being flushed to the database before the shipment deletion, causing the foreign key violation.

## Solutions Implemented

### ✅ Solution 1: JPA Entity-Level Cascade (RECOMMENDED)

**Changes Made:**

1. **Added bi-directional relationship in Shipment entity:**
```java
@OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ShipmentWorker> shipmentWorkers;
```

2. **Updated ShipmentWorker entity (optional but good practice):**
```java
@ManyToOne(cascade = CascadeType.REMOVE)
@JoinColumn(name = "shipment_id")
private Shipment shipment;
```

3. **Simplified the delete method:**
```java
@Transactional
public void deleteShipment(int id) {
    Shipment shipment = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
    
    // Delete related shipment items
    shipmentItemRepository.findByShipmentId(id).forEach(item -> {
        shipmentItemRepository.deleteById(item.getId());
    });
    
    // Delete the shipment (cascade will handle shipment_workers automatically)
    repo.deleteById(id);
}
```

**Benefits:**
- ✅ Clean and maintainable code
- ✅ JPA handles the cascade automatically
- ✅ Works regardless of database constraint configuration
- ✅ No database changes required

### 🔧 Solution 2: Database-Level CASCADE (Optional Backup)

If you want to also fix the database constraint (for consistency), run:
```sql
-- Find the actual constraint name
SHOW CREATE TABLE shipment_workers;

-- Drop and recreate with CASCADE
ALTER TABLE shipment_workers DROP FOREIGN KEY FK6mc9pdb2vi7vo65icsy1yfsou;
ALTER TABLE shipment_workers
ADD CONSTRAINT FK6mc9pdb2vi7vo65icsy1yfsou
FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE;
```

Script available at: `fix_foreign_key_cascade.sql`

## Testing

After restarting your Spring Boot application:

1. Create a test shipment
2. Assign workers to it (this creates records in `shipment_workers`)
3. Try to delete the shipment
4. ✅ It should now delete successfully, along with all related `shipment_workers` records

## Why This Happened

1. Your database was likely created using Hibernate's `ddl-auto` setting (like `update` or `create`)
2. Hibernate auto-generates foreign keys without `ON DELETE CASCADE` by default
3. The migration scripts you created later had the correct definition, but they only run on fresh databases
4. Your existing database still had the old constraint without CASCADE

## Prevention

To prevent this in the future:

1. ✅ Always define cascade behavior in JPA entities for parent-child relationships
2. ✅ Use explicit migration scripts and disable `spring.jpa.hibernate.ddl-auto` in production
3. ✅ Test delete operations when implementing entity relationships

## Related Files Modified

- ✅ `Entity/Shipment.java` - Added bi-directional relationship with cascade
- ✅ `Entity/ShipmentWorker.java` - Added cascade to the relationship
- ✅ `Service/ShipmentServiceImpl.java` - Simplified delete logic
- 📝 `resources/fix_foreign_key_cascade.sql` - SQL script for database fix (optional)

