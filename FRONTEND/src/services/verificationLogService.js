import api from './api';

export const getVerificationLogsByShipmentItem = async (itemId) => {
  const response = await api.get(`/api/verification-logs/shipment-item/${itemId}`);
  return response.data;
};

export const createVerificationLog = async (logData) => {
  const response = await api.post('/api/verification-logs/create', logData);
  return response.data;
};

