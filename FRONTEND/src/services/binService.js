import api from "./api";

export const getBinsByRack = async (rackId) => {
  const response = await api.get(`/api/bins/rack/${rackId}`);
  return response.data;
};

export const createBin = async (binData) => {
  const response = await api.post("/api/bins/create", binData);
  return response.data;
};
