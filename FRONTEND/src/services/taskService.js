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
