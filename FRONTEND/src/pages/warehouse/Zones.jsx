import { Edit2, Plus, Trash2, Warehouse } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const role = getRole();
  const canManage = role === "ADMIN";

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingZone) {
        await updateZone(editingZone.zoneId, formData);
      } else {
        await createZone(formData);
      }
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
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

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.zoneName,
      description: zone.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (zoneId) => {
    if (
      !window.confirm(
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    setFormData({ name: "", description: "" });
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
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => {
              const status = getOccupancyStatus(zone.occupancyPercentage);
              return (
                <Card key={zone.zoneId} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {zone.zoneName}
                      </h3>
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingZone ? "Edit Zone" : "Create Zone"}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Zone Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Zone description"
            />
          </div>
          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? editingZone
                  ? "Updating..."
                  : "Creating..."
                : editingZone
                ? "Update Zone"
                : "Create Zone"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
