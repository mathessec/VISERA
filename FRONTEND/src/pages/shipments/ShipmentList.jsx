import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/common/Table";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters";
import { getStatusColor } from "../../utils/helpers";

export default function ShipmentList() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await api.get("/api/shipments");
      setShipments(response.data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter((shipment) =>
    shipment.id?.toString().includes(searchTerm)
  );

  if (loading) return <Loading text="Loading shipments..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Shipment Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track all inbound and outbound shipments
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/shipments/create")}>
          <Plus size={20} className="mr-2" />
          Create Shipment
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Search size={20} className="mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Shipments Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium">SH-{shipment.id}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      shipment.shipmentType === "INBOUND" ? "blue" : "purple"
                    }
                  >
                    {shipment.shipmentType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </TableCell>
                <TableCell>{shipment.createdBy?.name || "-"}</TableCell>
                <TableCell>
                  {shipment.assignedTo?.name || "Unassigned"}
                </TableCell>
                <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredShipments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No shipments found
          </div>
        )}
      </Card>
    </div>
  );
}
