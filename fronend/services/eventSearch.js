
import api from "./api";

export async function searchEvents(filters) {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params[key] = value;
    }
  });

  const response = await api.get("/events/search", { params });
  return response.data;
}
