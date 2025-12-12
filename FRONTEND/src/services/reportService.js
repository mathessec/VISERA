import api from "./api";

export const getAnalytics = async () => {
  const response = await api.get("/api/reports/analytics");
  return response.data;
};
