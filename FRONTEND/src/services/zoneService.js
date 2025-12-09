import api from './api';

export const getAllZones = async () => {
  const response = await api.get('/api/zones/all');
  return response.data;
};

export const createZone = async (zoneData) => {
  const response = await api.post('/api/zones/create', zoneData);
  return response.data;
};

export const deleteZone = async (zoneId) => {
  const response = await api.delete(`/api/zones/delete/${zoneId}`);
  return response.data;
};
