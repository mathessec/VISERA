import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Select from "../../components/common/Select";
import { getAllProducts } from "../../services/productService";
import { createSku } from "../../services/skuService";

export default function SkuCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: searchParams.get("productId") || "",
    skuCode: "",
    weight: "",
    dimensions: "",
    color: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || ""
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        productId: parseInt(formData.productId),
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };
      await createSku(payload);
      navigate("/skus");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create SKU");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts) return <Loading text="Loading products..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/skus")}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create SKU</h1>
          <p className="text-gray-600 mt-1">Add a new Stock Keeping Unit</p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Product"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            options={[
              { value: "", label: "Select a product" },
              ...products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.category})`,
              })),
            ]}
          />

          <Input
            label="SKU Code"
            name="skuCode"
            value={formData.skuCode}
            onChange={handleChange}
            required
            placeholder="e.g., PROD-001-BLUE"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={handleChange}
              placeholder="0.00"
            />

            <Input
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g., Blue, Red"
            />
          </div>

          <Input
            label="Dimensions"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            placeholder="e.g., 10x5x3 cm"
          />

          <Input
            label="Image URL"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create SKU"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/skus")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
