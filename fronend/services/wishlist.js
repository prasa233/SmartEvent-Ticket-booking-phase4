
import api from "./api";

export const getWishlist = () => api.get("/wishlist/");
export const addToWishlist = (eventId) =>
  api.post(`/wishlist/${eventId}`);

export const removeFromWishlist = (eventId) =>
  api.delete(`/wishlist/${eventId}`);
