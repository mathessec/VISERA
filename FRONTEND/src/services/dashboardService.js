import { getAllShipments } from './shipmentService';
import { getPendingApprovals } from './approvalService';
import { getAllUsers } from './userService';
import { getTasksByUser } from './taskService';
import { getItemsByShipment } from './shipmentItemService';

/**
 * Get supervisor dashboard metrics and data
 * Aggregates data from multiple services to provide dashboard statistics
 */
export const getSupervisorDashboardMetrics = async () => {
  try {
    // Fetch all required data in parallel, but handle errors gracefully
    const [shipmentsResult, approvalsResult, usersResult] = await Promise.allSettled([
      getAllShipments(),
      getPendingApprovals(),
      getAllUsers(), // May fail for supervisors (requires ADMIN role)
    ]);

    // Extract successful results, defaulting to empty arrays on failure
    const shipments = shipmentsResult.status === 'fulfilled' ? shipmentsResult.value : [];
    const approvals = approvalsResult.status === 'fulfilled' ? approvalsResult.value : [];
    const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
    
    // Log errors for debugging (but don't fail the entire dashboard)
    if (shipmentsResult.status === 'rejected') {
      console.error('Error fetching shipments:', shipmentsResult.reason);
    }
    if (approvalsResult.status === 'rejected') {
      console.error('Error fetching approvals:', approvalsResult.reason);
    }
    if (usersResult.status === 'rejected') {
      console.warn('Could not fetch users (may require ADMIN role):', usersResult.reason);
    }

    // Filter workers from users if available
    let workers = users.filter((u) => u.role === 'WORKER');
    
    // Always try to extract worker info from shipments as a supplement/fallback
    // This ensures we get workers even if user list is empty or incomplete
    const workerMap = new Map();
    
    // Add workers from user list
    workers.forEach((worker) => {
      workerMap.set(worker.id, worker);
    });
    
    // Add workers from shipments (this will supplement or replace if user list was empty)
    if (shipments.length > 0) {
      shipments.forEach((shipment) => {
        if (shipment.assignedWorkers && Array.isArray(shipment.assignedWorkers)) {
          shipment.assignedWorkers.forEach((worker) => {
            if (worker.role === 'WORKER' && !workerMap.has(worker.id)) {
              workerMap.set(worker.id, worker);
            }
          });
        }
      });
    }
    
    workers = Array.from(workerMap.values());
    
    // Debug logging
    console.log('Dashboard metrics - Workers found:', {
      fromUsers: users.filter((u) => u.role === 'WORKER').length,
      fromShipments: workerMap.size - users.filter((u) => u.role === 'WORKER').length,
      total: workers.length,
      shipmentsWithWorkers: shipments.filter((s) => s.assignedWorkers && s.assignedWorkers.length > 0).length,
      totalShipments: shipments.length,
    });

    // Calculate active shipments (status != 'COMPLETED')
    const activeShipments = shipments.filter(
      (s) => s.status && s.status !== 'COMPLETED'
    ).length;

    // Pending approvals count
    const pendingApprovals = approvals.length;

    // Get today's date for filtering tasks completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch tasks for all workers to calculate metrics
    // If we have no workers, we can still calculate some metrics
    let workerTasksResults = [];
    if (workers.length > 0) {
      const workerTasksPromises = workers.map(async (worker) => {
        try {
          const tasks = await getTasksByUser(worker.id);
          return { worker, tasks };
        } catch (err) {
          console.error(`Error fetching tasks for worker ${worker.id}:`, err);
          return { worker, tasks: [] };
        }
      });

      workerTasksResults = await Promise.all(workerTasksPromises);
    }

    // Calculate active workers - workers with at least one non-completed task
    // OR workers assigned to active shipments
    let activeWorkersFromTasks = 0;
    
    if (workerTasksResults.length > 0) {
      // Count workers with active tasks
      activeWorkersFromTasks = workerTasksResults.filter(
        ({ tasks }) => tasks.some((t) => t.status && t.status !== 'COMPLETED')
      ).length;
    }
    
    // Also count workers assigned to active shipments (they're active even without tasks)
    const activeShipmentWorkers = new Set();
    shipments
      .filter((s) => s.status && s.status !== 'COMPLETED')
      .forEach((shipment) => {
        if (shipment.assignedWorkers && Array.isArray(shipment.assignedWorkers)) {
          shipment.assignedWorkers.forEach((worker) => {
            if (worker.role === 'WORKER') {
              activeShipmentWorkers.add(worker.id);
            }
          });
        }
      });
    
    // Active workers = workers with active tasks OR workers assigned to active shipments
    // Use a Set to avoid double-counting
    const allActiveWorkers = new Set();
    
    // Add workers with active tasks
    workerTasksResults
      .filter(({ tasks }) => tasks.some((t) => t.status && t.status !== 'COMPLETED'))
      .forEach(({ worker }) => {
        allActiveWorkers.add(worker.id);
      });
    
    // Add workers assigned to active shipments
    activeShipmentWorkers.forEach((workerId) => {
      allActiveWorkers.add(workerId);
    });
    
    const activeWorkers = allActiveWorkers.size;
    
    // Debug logging
    console.log('Dashboard metrics - Active workers:', {
      fromTasks: activeWorkersFromTasks,
      fromActiveShipments: activeShipmentWorkers.size,
      totalUnique: activeWorkers,
    });

    // Calculate tasks completed today
    // Note: Since Task entity doesn't have completedAt, we use createdAt as approximation
    // This counts tasks that were created today AND are completed
    // For accurate "completed today", the backend should add a completedAt field
    let tasksCompletedToday = 0;
    let completedTasksWithoutDate = 0;
    let totalCompletedTasks = 0;
    
    workerTasksResults.forEach(({ tasks, worker }) => {
      tasks.forEach((task) => {
        if (task.status === 'COMPLETED') {
          totalCompletedTasks++;
          if (task.createdAt) {
            try {
              const taskDate = new Date(task.createdAt);
              // Check if task was created today (approximation for completed today)
              // Compare dates ignoring time for more accurate comparison
              const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
              const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              
              if (taskDateOnly.getTime() === todayOnly.getTime()) {
                tasksCompletedToday++;
              }
            } catch (e) {
              console.error('Error parsing task createdAt:', task.createdAt, e);
              completedTasksWithoutDate++;
            }
          } else {
            // If createdAt is missing, we can't determine when it was completed
            completedTasksWithoutDate++;
          }
        }
      });
    });
    
    // Debug logging
    console.log('Dashboard metrics - Tasks completed today:', {
      completedToday: tasksCompletedToday,
      completedTasksWithoutDate,
      totalCompletedTasks,
      workersWithTasks: workerTasksResults.length,
      totalWorkers: workers.length,
      note: 'Using createdAt as approximation (backend should add completedAt field for accuracy)',
    });

    // Format pending mismatches from approvals
    const pendingMismatches = approvals.slice(0, 4).map((approval) => {
      let extractedData = {};
      let expectedData = {};

      try {
        if (approval.extractedData) {
          extractedData = JSON.parse(approval.extractedData);
        }
      } catch (e) {
        console.error('Error parsing extractedData:', e);
      }

      try {
        if (approval.expectedData) {
          expectedData = JSON.parse(approval.expectedData);
        }
      } catch (e) {
        console.error('Error parsing expectedData:', e);
      }

      // Extract SKU codes
      const predictedSku = expectedData.skuCode || expectedData.sku || 'N/A';
      const scannedSku =
        extractedData.sku ||
        extractedData.skuCode ||
        extractedData.sku_code ||
        'N/A';

      // Extract confidence score (convert from 0-1 to 0-100 if needed)
      let confidence = 0;
      if (extractedData.confidence_score !== undefined) {
        confidence =
          extractedData.confidence_score <= 1
            ? extractedData.confidence_score * 100
            : extractedData.confidence_score;
      } else if (extractedData.confidence !== undefined) {
        confidence =
          extractedData.confidence <= 1
            ? extractedData.confidence * 100
            : extractedData.confidence;
      }

      return {
        id: `MIS-${approval.id}`,
        predictedSku,
        scannedSku,
        worker: approval.requestedByName || 'Unknown',
        confidence: Math.round(confidence),
      };
    });

    // Format worker task overview
    // Show workers with active tasks OR workers assigned to active shipments
    // Create an array to hold all task entries (one per active task)
    const workerTaskEntries = [];
    
    // First, add all active tasks for each worker
    workerTasksResults
      .filter(({ tasks }) => tasks.some((t) => t.status !== 'COMPLETED'))
      .forEach(({ worker, tasks }) => {
        // Get ALL active tasks for this worker, not just the first one
        const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');
        
        activeTasks.forEach((activeTask) => {
          let status = 'In Progress';
          if (activeTask.status === 'PENDING') {
            status = 'Pending';
          }
          
          workerTaskEntries.push({
            workerName: worker.name,
            workerId: worker.id,
            taskType: activeTask.taskType || 'PUTAWAY',
            shipmentItemId: activeTask.shipmentItemId,
            taskId: activeTask.id,
            status,
            itemsCompleted: 0,
            itemsTotal: 0,
            hasTask: true,
          });
        });
      });
    
    // Create a map to track which workers we've already added (for shipment assignments)
    const workersWithTasks = new Set(workerTaskEntries.map(entry => entry.workerId));
    
    // Also add workers assigned to active shipments (even if they don't have tasks yet)
    shipments
      .filter((s) => s.status && s.status !== 'COMPLETED')
      .forEach((shipment) => {
        if (shipment.assignedWorkers && Array.isArray(shipment.assignedWorkers)) {
          shipment.assignedWorkers.forEach((worker) => {
            if (worker.role === 'WORKER' && !workersWithTasks.has(worker.id)) {
              // Worker is assigned to active shipment but doesn't have a task yet
              workerTaskEntries.push({
                workerName: worker.name,
                workerId: worker.id,
                taskType: 'ASSIGNED',
                shipmentItemId: null,
                shipmentId: shipment.id,
                status: 'Assigned',
                itemsCompleted: 0,
                itemsTotal: shipment.packageCount || 0,
                hasTask: false,
              });
            } else if (worker.role === 'WORKER' && workersWithTasks.has(worker.id)) {
              // Worker already has tasks, try to enhance existing entries with shipment info
              workerTaskEntries.forEach((entry) => {
                if (entry.workerId === worker.id && !entry.shipmentId && shipment.id) {
                  entry.shipmentId = shipment.id;
                  if (entry.itemsTotal === 0) {
                    entry.itemsTotal = shipment.packageCount || 0;
                  }
                }
              });
            }
          });
        }
      });
    
    // Limit to first 6 entries (to show multiple tasks per worker)
    const workerTaskOverview = workerTaskEntries.slice(0, 6);
    
    // Debug logging
    console.log('Dashboard metrics - Worker task overview:', {
      totalActiveTasks: workerTaskEntries.filter(e => e.hasTask).length,
      workersWithTasks: workersWithTasks.size,
      workersAssignedToShipments: workerTaskEntries.filter(e => !e.hasTask).length,
      totalInOverview: workerTaskOverview.length,
      entries: workerTaskOverview.map(e => ({
        worker: e.workerName,
        taskType: e.taskType,
        status: e.status,
        shipmentId: e.shipmentId,
        shipmentItemId: e.shipmentItemId,
      })),
    });

    // Enhance worker task overview with shipment info
    // Create a map of shipment items to shipments for efficient lookup
    const shipmentItemMap = new Map();
    
    // Only fetch shipment items if we have worker tasks to enhance
    if (workerTaskOverview.length > 0 && shipments.length > 0) {
      // Fetch shipment items for all shipments in parallel (limited to first 10 to avoid too many calls)
      const shipmentItemsPromises = shipments.slice(0, 10).map(async (shipment) => {
        try {
          const items = await getItemsByShipment(shipment.id);
          items.forEach((item) => {
            shipmentItemMap.set(item.id, {
              shipmentId: shipment.id,
              quantity: item.quantity || 0,
            });
          });
        } catch (err) {
          // Continue if one shipment fails
          console.error(`Error fetching items for shipment ${shipment.id}:`, err);
        }
      });

      await Promise.all(shipmentItemsPromises);
    }

    // Enhance worker task overview with shipment info from the map
    const enhancedWorkerTaskOverview = workerTaskOverview.map((taskOverview) => {
      const itemInfo = shipmentItemMap.get(taskOverview.shipmentItemId);
      if (itemInfo) {
        return {
          ...taskOverview,
          shipmentId: itemInfo.shipmentId,
          itemsTotal: itemInfo.quantity,
          // Estimate items completed based on task status
          itemsCompleted:
            taskOverview.status === 'Completed'
              ? itemInfo.quantity
              : Math.floor(itemInfo.quantity * 0.7), // Estimate 70% for in-progress
        };
      }
      return taskOverview;
    });

    return {
      metrics: {
        activeShipments,
        pendingApprovals,
        activeWorkers,
        completedToday: tasksCompletedToday,
      },
      pendingMismatches,
      workerTaskOverview: enhancedWorkerTaskOverview,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

