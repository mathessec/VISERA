import {
  Box,
  ChevronDown,
  ChevronRight,
  Edit2,
  Package,
  Plus,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";
import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import { Progress } from "../../components/common/Progress";
import { getRole } from "../../services/authService";
import { createBin, getBinsWithStatusByRack } from "../../services/binService";
import { createRack, getRacksWithBinsByZone } from "../../services/rackService";
import {
  createZone,
  deleteZone,
  getZoneStatistics,
  updateZone,
} from "../../services/zoneService";

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isRackModalOpen, setIsRackModalOpen] = useState(false);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneFormData, setZoneFormData] = useState({
    name: "",
    description: "",
  });
  const [rackFormData, setRackFormData] = useState({
    zoneId: "",
    name: "",
    description: "",
  });
  const [binFormData, setBinFormData] = useState({
    rackId: "",
    name: "",
    capacity: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Hierarchical state
  const [expandedZones, setExpandedZones] = useState(new Set());
  const [expandedRacks, setExpandedRacks] = useState(new Map()); // Map<zoneId, Set<rackId>>
  const [zoneRacks, setZoneRacks] = useState(new Map()); // Map<zoneId, racks[]>
  const [rackBins, setRackBins] = useState(new Map()); // Map<rackId, bins[]>
  const [loadingRacks, setLoadingRacks] = useState(new Set()); // Set<zoneId>
  const [loadingBins, setLoadingBins] = useState(new Set()); // Set<rackId>

  const role = getRole();
  const canManage = role === "ADMIN";
  const canManageRacks = role === "ADMIN" || role === "SUPERVISOR";

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const data = await getZoneStatistics();
      setZones(data);
    } catch (error) {
      console.error("Failed to load zones:", error);
      setError("Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  const fetchRacksForZone = async (zoneId) => {
    if (zoneRacks.has(zoneId)) return; // Already loaded

    setLoadingRacks((prev) => new Set(prev).add(zoneId));
    try {
      const racks = await getRacksWithBinsByZone(zoneId);
      setZoneRacks((prev) => new Map(prev).set(zoneId, racks));
    } catch (error) {
      console.error("Failed to load racks:", error);
      setError("Failed to load racks");
    } finally {
      setLoadingRacks((prev) => {
        const next = new Set(prev);
        next.delete(zoneId);
        return next;
      });
    }
  };

  const fetchBinsForRack = async (rackId) => {
    if (rackBins.has(rackId)) return; // Already loaded

    setLoadingBins((prev) => new Set(prev).add(rackId));
    try {
      const bins = await getBinsWithStatusByRack(rackId);
      setRackBins((prev) => new Map(prev).set(rackId, bins));
    } catch (error) {
      console.error("Failed to load bins:", error);
      setError("Failed to load bins");
    } finally {
      setLoadingBins((prev) => {
        const next = new Set(prev);
        next.delete(rackId);
        return next;
      });
    }
  };

  const toggleZone = (zoneId) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
        fetchRacksForZone(zoneId);
      }
      return next;
    });
  };

  const toggleRack = (zoneId, rackId) => {
    setExpandedRacks((prev) => {
      const next = new Map(prev);
      const rackSet = next.get(zoneId) || new Set();
      const newRackSet = new Set(rackSet);

      if (newRackSet.has(rackId)) {
        newRackSet.delete(rackId);
      } else {
        newRackSet.add(rackId);
        fetchBinsForRack(rackId);
      }

      next.set(zoneId, newRackSet);
      return next;
    });
  };

  const handleZoneCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingZone) {
        await updateZone(editingZone.zoneId, zoneFormData);
      } else {
        await createZone(zoneFormData);
      }
      setIsZoneModalOpen(false);
      setZoneFormData({ name: "", description: "" });
      setEditingZone(null);
      fetchZones();
    } catch (error) {
      console.error("Failed to save zone:", error);
      setError(
        error.response?.data?.message ||
          `Failed to ${editingZone ? "update" : "create"} zone`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRackCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRack({
        zoneId: Number.parseInt(rackFormData.zoneId, 10),
        name: rackFormData.name,
        description: rackFormData.description || "",
      });
      setIsRackModalOpen(false);
      setRackFormData({ zoneId: "", name: "", description: "" });

      // Refresh racks for the zone
      const zoneId = Number.parseInt(rackFormData.zoneId, 10);
      const racks = await getRacksWithBinsByZone(zoneId);
      setZoneRacks((prev) => new Map(prev).set(zoneId, racks));

      // Refresh zone statistics
      fetchZones();
    } catch (error) {
      console.error("Failed to create rack:", error);
      setError(error.response?.data?.message || "Failed to create rack");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBinCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(""); // Clear previous errors

    try {
      // Validate name
      const name = binFormData.name.trim();
      if (!name) {
        setError("Bin name is required");
        setSubmitting(false);
        return;
      }

      // Validate capacity
      const capacity = Number.parseInt(binFormData.capacity, 10);
      if (Number.isNaN(capacity) || capacity <= 0) {
        setError("Capacity must be a positive number");
        setSubmitting(false);
        return;
      }

      // Validate rackId
      const rackId = Number.parseInt(binFormData.rackId, 10);
      if (Number.isNaN(rackId) || rackId <= 0) {
        setError("Invalid rack selection");
        setSubmitting(false);
        return;
      }

      await createBin({
        rackId: rackId,
        name: name,
        capacity: capacity,
      });
      setIsBinModalOpen(false);
      setBinFormData({ rackId: "", name: "", capacity: "" });

      // Refresh bins for the rack
      const bins = await getBinsWithStatusByRack(rackId);
      setRackBins((prev) => new Map(prev).set(rackId, bins));

      // Refresh racks to update bin count
      const racks = zoneRacks.get(
        Number.parseInt(rackFormData.zoneId || "0", 10)
      );
      if (racks) {
        const rack = racks.find((r) => r.id === rackId);
        if (rack) {
          const updatedRacks = await getRacksWithBinsByZone(rack.zoneId);
          setZoneRacks((prev) => new Map(prev).set(rack.zoneId, updatedRacks));
        }
      }

      // Refresh zone statistics
      fetchZones();
    } catch (error) {
      console.error("Failed to create bin:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(", ")
          : "Failed to create bin");
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setZoneFormData({
      name: zone.zoneName,
      description: zone.description || "",
    });
    setIsZoneModalOpen(true);
  };

  const handleDelete = async (zoneId) => {
    if (
      !globalThis.confirm(
        "Are you sure you want to delete this zone? This action cannot be undone."
      )
    )
      return;
    try {
      await deleteZone(zoneId);
      fetchZones();
    } catch (error) {
      console.error("Failed to delete zone:", error);
      setError("Failed to delete zone");
    }
  };

  const handleCloseZoneModal = () => {
    setIsZoneModalOpen(false);
    setEditingZone(null);
    setZoneFormData({ name: "", description: "" });
  };

  const handleOpenRackModal = (zoneId) => {
    setRackFormData({ zoneId: zoneId.toString(), name: "", description: "" });
    setIsRackModalOpen(true);
  };

  const handleCloseRackModal = () => {
    setIsRackModalOpen(false);
    setRackFormData({ zoneId: "", name: "", description: "" });
  };

  const handleOpenBinModal = (rackId, zoneId) => {
    setBinFormData({
      rackId: rackId.toString(),
      name: "",
      capacity: "",
    });
    setRackFormData((prev) => ({ ...prev, zoneId: zoneId.toString() }));
    setIsBinModalOpen(true);
  };

  const handleCloseBinModal = () => {
    setIsBinModalOpen(false);
    setBinFormData({ rackId: "", name: "", code: "", capacity: "" });
  };

  const getOccupancyStatus = (percentage) => {
    if (percentage >= 80) return { label: "High Occupancy", variant: "red" };
    if (percentage >= 60)
      return { label: "Medium Occupancy", variant: "orange" };
    return { label: "Low Occupancy", variant: "green" };
  };

  const getHeatMapColor = (percentage) => {
    if (percentage >= 80) return "bg-red-100";
    if (percentage >= 70) return "bg-orange-200";
    if (percentage >= 60) return "bg-orange-100";
    return "bg-green-100";
  };

  if (loading) return <Loading text="Loading zones..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Layout</h1>
          <p className="text-gray-600 mt-1">
            View and manage warehouse zones, racks, and bins
          </p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => setIsZoneModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Add Zone
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {zones.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <Warehouse size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No zones found</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Zone Cards Grid */}
          <div className="space-y-4">
            {zones.map((zone) => {
              const status = getOccupancyStatus(zone.occupancyPercentage);
              const isExpanded = expandedZones.has(zone.zoneId);
              const racks = zoneRacks.get(zone.zoneId) || [];
              const expandedRacksForZone =
                expandedRacks.get(zone.zoneId) || new Set();
              const isLoadingRacks = loadingRacks.has(zone.zoneId);

              return (
                <Card key={zone.zoneId} className="p-6">
                  <div className="space-y-4">
                    {/* Zone Header - Clickable to expand */}
                    <div className="flex items-start justify-between">
                      <div
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => toggleZone(zone.zoneId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleZone(zone.zoneId);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {isExpanded ? (
                          <ChevronDown size={20} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-500" />
                        )}
                        <h3 className="text-xl font-semibold text-gray-900">
                          {zone.zoneName}
                        </h3>
                      </div>
                      {canManage && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(zone)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(zone.zoneId)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Racks</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {zone.totalRacks}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Bins</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {zone.totalBins}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">Occupancy</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {zone.occupancyPercentage}%
                        </p>
                      </div>
                      <Progress value={zone.occupancyPercentage} />
                      <p className="text-sm text-gray-600 mt-2">
                        {zone.occupiedBins} / {zone.totalBins} bins occupied
                      </p>
                    </div>

                    <Badge
                      variant={status.variant}
                      className="w-full justify-center py-2"
                    >
                      {status.label}
                    </Badge>

                    {/* Expandable Racks Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Racks
                          </h4>
                          {canManageRacks && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenRackModal(zone.zoneId)}
                            >
                              <Plus size={16} className="mr-1" />
                              Add Rack
                            </Button>
                          )}
                        </div>

                        {(() => {
                          if (isLoadingRacks) {
                            return <Loading text="Loading racks..." />;
                          }
                          if (racks.length === 0) {
                            return (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                <Package
                                  size={24}
                                  className="mx-auto mb-2 text-gray-400"
                                />
                                <p>No racks in this zone</p>
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-2">
                              {racks.map((rack) => {
                                const isRackExpanded = expandedRacksForZone.has(
                                  rack.id
                                );
                                const bins = rackBins.get(rack.id) || [];
                                const isLoadingBins = loadingBins.has(rack.id);

                                return (
                                  <div
                                    key={rack.id}
                                    className="border border-gray-200 rounded-lg"
                                  >
                                    {/* Rack Row */}
                                    <div
                                      className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                                      onClick={() =>
                                        toggleRack(zone.zoneId, rack.id)
                                      }
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          e.preventDefault();
                                          toggleRack(zone.zoneId, rack.id);
                                        }
                                      }}
                                      role="button"
                                      tabIndex={0}
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        {isRackExpanded ? (
                                          <ChevronDown
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ) : (
                                          <ChevronRight
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        )}
                                        <Package
                                          size={16}
                                          className="text-gray-500"
                                        />
                                        <span className="font-medium text-gray-900">
                                          {rack.name}
                                        </span>
                                        {rack.description && (
                                          <span className="text-sm text-gray-500">
                                            - {rack.description}
                                          </span>
                                        )}
                                      </div>
                                      <Badge variant="outline" className="ml-2">
                                        {rack.binCount} bins
                                      </Badge>
                                    </div>

                                    {/* Expandable Bins Section */}
                                    {isRackExpanded && (
                                      <div className="p-3 bg-white border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="text-sm font-semibold text-gray-700">
                                            Bins
                                          </h5>
                                          {canManageRacks && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenBinModal(
                                                  rack.id,
                                                  zone.zoneId
                                                );
                                              }}
                                            >
                                              <Plus
                                                size={14}
                                                className="mr-1"
                                              />
                                              Add Bin
                                            </Button>
                                          )}
                                        </div>

                                        {(() => {
                                          if (isLoadingBins) {
                                            return (
                                              <Loading text="Loading bins..." />
                                            );
                                          }
                                          if (bins.length === 0) {
                                            return (
                                              <div className="text-center py-3 text-gray-500 text-sm">
                                                <Box
                                                  size={20}
                                                  className="mx-auto mb-1 text-gray-400"
                                                />
                                                <p>No bins in this rack</p>
                                              </div>
                                            );
                                          }
                                          return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                              {bins.map((bin) => (
                                                <div
                                                  key={bin.id}
                                                  className={`p-2 rounded border ${
                                                    bin.isOccupied
                                                      ? "border-orange-300 bg-orange-50"
                                                      : "border-gray-200 bg-gray-50"
                                                  }`}
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                      <p className="font-medium text-sm text-gray-900">
                                                        {bin.name || bin.code}
                                                      </p>
                                                      <p className="text-xs text-gray-500">
                                                        Capacity: {bin.capacity}
                                                      </p>
                                                    </div>
                                                    <Badge
                                                      variant={
                                                        bin.isOccupied
                                                          ? "orange"
                                                          : "green"
                                                      }
                                                      className="ml-2"
                                                    >
                                                      {bin.isOccupied
                                                        ? "Occupied"
                                                        : "Empty"}
                                                    </Badge>
                                                  </div>
                                                  {bin.isOccupied && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                      Qty: {bin.currentQuantity}
                                                    </p>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Warehouse Heat Map */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Warehouse Heat Map
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {zones.map((zone) => (
                <div
                  key={zone.zoneId}
                  className={`p-6 rounded-lg border border-gray-200 ${getHeatMapColor(
                    zone.occupancyPercentage
                  )}`}
                >
                  <p className="font-semibold text-gray-900 text-center">
                    {zone.zoneName}
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    {zone.occupancyPercentage}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Zone Modal */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={handleCloseZoneModal}
        title={editingZone ? "Edit Zone" : "Create Zone"}
      >
        <form onSubmit={handleZoneCreate} className="space-y-4">
          <Input
            label="Zone Name"
            name="name"
            value={zoneFormData.name}
            onChange={(e) =>
              setZoneFormData({ ...zoneFormData, name: e.target.value })
            }
            required
            placeholder="e.g., Zone A, Zone B"
          />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={zoneFormData.description}
              onChange={(e) =>
                setZoneFormData({
                  ...zoneFormData,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Zone description"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {(() => {
                if (submitting) {
                  return editingZone ? "Updating..." : "Creating...";
                }
                return editingZone ? "Update Zone" : "Create Zone";
              })()}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseZoneModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Rack Modal */}
      <Modal
        isOpen={isRackModalOpen}
        onClose={handleCloseRackModal}
        title="Create Rack"
      >
        <form onSubmit={handleRackCreate} className="space-y-4">
          <Input
            label="Rack Name"
            name="name"
            value={rackFormData.name}
            onChange={(e) =>
              setRackFormData({ ...rackFormData, name: e.target.value })
            }
            required
            placeholder="e.g., Rack 1, Rack 2"
          />
          <div>
            <label
              htmlFor="rack-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="rack-description"
              name="description"
              value={rackFormData.description}
              onChange={(e) =>
                setRackFormData({
                  ...rackFormData,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Rack description"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Rack"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseRackModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Bin Modal */}
      <Modal
        isOpen={isBinModalOpen}
        onClose={handleCloseBinModal}
        title="Create Bin"
      >
        <form onSubmit={handleBinCreate} className="space-y-4">
          <Input
            label="Bin Name"
            name="name"
            value={binFormData.name}
            onChange={(e) =>
              setBinFormData({ ...binFormData, name: e.target.value })
            }
            required
            placeholder="e.g., Bin A1, Bin B2"
          />
          <Input
            label="Capacity"
            name="capacity"
            type="number"
            value={binFormData.capacity}
            onChange={(e) =>
              setBinFormData({ ...binFormData, capacity: e.target.value })
            }
            required
            min="1"
            placeholder="Maximum quantity"
          />
          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Bin"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseBinModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
