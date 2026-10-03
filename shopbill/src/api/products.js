import { apiRequest } from "./api";

export function getProducts() {
  return apiRequest("/api/products");
}

export function createProduct(payload) {
  return apiRequest("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return apiRequest(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return apiRequest(`/api/products/${id}`, {
    method: "DELETE",
  });
}
