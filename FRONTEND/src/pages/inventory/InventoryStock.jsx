import { Package, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import { getBinsByRack } from "../../services/binService";
import { getStock } from "../../services/inventoryService";
import { getRacksByZone } from "../../services/rackService";
import { getAllSkus } from "../../services/skuService";
import { getAllZones } from "../../services/zoneService";

export default function InventoryStock() {
  const [stock, setStock] = useState(null);
  const [skus, setSkus] = useState([]);
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [bins, setBins] = useState([]);
  const [selectedSku, setSelectedSku] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedRack, setSelectedRack] = useState("");
  const [selectedBin, setSelectedBin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchRacks();
    } else {
      setRacks([]);
      setSelectedRack("");
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedRack) {
      fetchBins();
    } else {
      setBins([]);
      setSelectedBin("");
    }
  }, [selectedRack]);

  const fetchInitialData = async () => {
    try {
      const [skusData, zonesData] = await Promise.all([
        getAllSkus(),
        getAllZones(),
      ]);
      setSkus(skusData);
      setZones(zonesData);
      if (zonesData.length > 0) {
        setSelectedZone(zonesData[0].id.toString());
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchRacks = async () => {
    try {
      const data = await getRacksByZone(parseInt(selectedZone));
      setRacks(data);
      if (data.length > 0) {
        setSelectedRack(data[0].id.toString());
      }
    } catch (err) {
      setError("Failed to load racks");
    }
  };

  const fetchBins = async () => {
    try {
      const data = await getBinsByRack(parseInt(selectedRack));
      setBins(data);
      if (data.length > 0) {
        setSelectedBin(data[0].id.toString());
      }
    } catch (err) {
      setError("Failed to load bins");
    }
  };

  const handleSearch = async () => {
    if (!selectedSku || !selectedBin) {
      setError("Please select both SKU and Bin");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getStock(parseInt(selectedSku), parseInt(selectedBin));
      setStock(data);
    } catch (err) {
      setError("Stock not found for this SKU and Bin combination");
      setStock(null);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <Loading text="Loading data..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Stock</h1>
        <p className="text-gray-600 mt-1">View stock levels by SKU and Bin</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="SKU"
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              options={[
                { value: "", label: "Select a SKU" },
                ...skus.map((sku) => ({
                  value: sku.id.toString(),
                  label: `${sku.skuCode} - Product #${sku.productId}`,
                })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Zone → Rack → Bin)
              </label>
              <div className="space-y-2">
                <Select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  options={[
                    { value: "", label: "Select Zone" },
                    ...zones.map((z) => ({
                      value: z.id.toString(),
                      label: z.name,
                    })),
                  ]}
                />
                {selectedZone && (
                  <Select
                    value={selectedRack}
                    onChange={(e) => setSelectedRack(e.target.value)}
                    options={[
                      { value: "", label: "Select Rack" },
                      ...racks.map((r) => ({
                        value: r.id.toString(),
                        label: r.name,
                      })),
                    ]}
                  />
                )}
                {selectedRack && (
                  <Select
                    value={selectedBin}
                    onChange={(e) => setSelectedBin(e.target.value)}
                    options={[
                      { value: "", label: "Select Bin" },
                      ...bins.map((b) => ({
                        value: b.id.toString(),
                        label: b.name,
                      })),
                    ]}
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={loading || !selectedSku || !selectedBin}
          >
            <Search size={20} className="mr-2" />
            {loading ? "Searching..." : "Search Stock"}
          </Button>
        </div>
      </Card>

      {stock && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  SKU ID
                </label>
                <p className="text-gray-900 font-semibold">#{stock.skuId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Bin ID
                </label>
                <p className="text-gray-900 font-semibold">#{stock.binId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Quantity
                </label>
                <p className="text-gray-900 font-semibold text-2xl">
                  {stock.quantity || 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={stock.quantity > 0 ? "green" : "red"}>
                    {stock.quantity > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!stock && !loading && (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Select SKU and Bin to view stock information</p>
          </div>
        </Card>
      )}
    </div>
  );
}
