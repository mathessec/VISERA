import api from "./api";

export const getRacksByZone = async (zoneId) => {
  const response = await api.get(`/api/racks/zone/${zoneId}`);
  return response.data;
};

export const createRack = async (rackData) => {
  const response = await api.post("/api/racks/create", rackData);
  return response.data;
};
