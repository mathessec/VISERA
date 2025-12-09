import { Plus, Trash2, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/common/Table";
import { getRole } from "../../services/authService";
import {
  createZone,
  deleteZone,
  getAllZones,
} from "../../services/zoneService";

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const role = getRole();
  const canManage = role === "ADMIN";

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const data = await getAllZones();
      setZones(data);
    } catch (err) {
      setError("Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createZone(formData);
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
      fetchZones();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create zone");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await deleteZone(zoneId);
      fetchZones();
    } catch (err) {
      setError("Failed to delete zone");
    }
  };

  if (loading) return <Loading text="Loading zones..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Zones</h1>
          <p className="text-gray-600 mt-1">Manage warehouse zones</p>
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell className="font-medium">#{zone.id}</TableCell>
                <TableCell>{zone.name}</TableCell>
                <TableCell>{zone.description || "-"}</TableCell>
                <TableCell>
                  <Badge variant="green">Active</Badge>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(zone.id)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {zones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Warehouse size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No zones found</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Zone"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
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
              {submitting ? "Creating..." : "Create Zone"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
