import api from './api';

export const getTasksByUser = async (userId) => {
  const response = await api.get(`/api/tasks/user/${userId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/api/tasks/create', taskData);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await api.patch(`/api/tasks/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

// Putaway operations
export const getPutawayItems = async (userId) => {
  const response = await api.get(`/api/tasks/putaway/user/${userId}`);
  return response.data;
};

export const getPutawayStatistics = async (userId) => {
  const response = await api.get(`/api/tasks/putaway/statistics/${userId}`);
  return response.data;
};

export const getRecentCompletions = async (userId) => {
  const response = await api.get(`/api/tasks/putaway/recent-completions/${userId}`);
  return response.data;
};

export const startPutaway = async (taskId) => {
  const response = await api.post(`/api/tasks/${taskId}/start-putaway`);
  return response.data;
};

export const completePutaway = async (taskId, binId, quantity) => {
  const response = await api.post(`/api/tasks/${taskId}/complete-putaway`, {
    binId,
    quantity
  });
  return response.data;
};

export const completePutawayWithAllocation = async (taskId, allocations) => {
  const response = await api.post(`/api/tasks/${taskId}/complete-putaway`, {
    allocations
  });
  return response.data;
};
