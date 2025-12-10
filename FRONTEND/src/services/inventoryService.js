import api from './api';

export const getStock = async (skuId, binId) => {
  const response = await api.get(`/api/inventory/get/${skuId}/${binId}`, {
    params: { skuId, binId }
  });
  return response.data;
};

export const createStock = async (stockData) => {
  const response = await api.post('/api/inventory/create', stockData);
  return response.data;
};

export const updateStock = async (skuId, binId, quantity) => {
  const response = await api.put(`/api/inventory/update`, {
    skuId,
    binId,
    quantity
  });
  return response.data;
};
