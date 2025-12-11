import api from "./api";

export const getBinsByRack = async (rackId) => {
  const response = await api.get(`/api/bins/rack/${rackId}`);
  return response.data;
};

// Alias for getBinsByRack - returns bins with their current status
// Status can be derived from the bin's inventory stock
export const getBinsWithStatusByRack = async (rackId) => {
  const response = await api.get(`/api/bins/rack/${rackId}`);
  return response.data;
};

export const createBin = async (binData) => {
  const response = await api.post("/api/bins/create", binData);
  return response.data;
};
