import api from "./api";

export const getAllShipments = async () => {
  const response = await api.get("/api/shipments");
  return response.data;
};

export const getShipmentById = async (id) => {
  const response = await api.get(`/api/shipments/${id}`);
  return response.data;
};

export const createShipment = async (shipmentData) => {
  const response = await api.post("/api/shipments/create", shipmentData);
  return response.data;
};

export const updateShipment = async (id, shipmentData) => {
  const response = await api.put(`/api/shipments/${id}`, shipmentData);
  return response.data;
};

export const assignShipment = async (id, userId) => {
  const response = await api.patch(`/api/shipments/${id}/assign`, { userId });
  return response.data;
};
