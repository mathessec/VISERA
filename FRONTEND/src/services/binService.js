import api from "./api";

export const getBinsByRack = async (rackId) => {
  const response = await api.get(`/api/bins/rack/${rackId}`);
  return response.data;
};

export const getBinsWithStatusByRack = async (rackId) => {
  const response = await api.get(`/api/bins/rack/${rackId}/with-status`);
  return response.data;
};

export const createBin = async (binData) => {
  const response = await api.post("/api/bins/create", {
    rackId: binData.rackId,
    name: binData.name,
    capacity: binData.capacity,
    // code is optional - backend will auto-generate from name if not provided
  });
  return response.data;
};
