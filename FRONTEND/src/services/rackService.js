import api from "./api";

export const getRacksByZone = async (zoneId) => {
  const response = await api.get(`/api/racks/zone/${zoneId}`);
  return response.data;
};

export const getRacksWithBinsByZone = async (zoneId) => {
  const response = await api.get(`/api/racks/zone/${zoneId}/with-bins`);
  return response.data;
};

export const createRack = async (rackData) => {
  const response = await api.post("/api/racks/create", {
    zoneId: rackData.zoneId,
    name: rackData.name,
    description: rackData.description || "",
  });
  return response.data;
};
