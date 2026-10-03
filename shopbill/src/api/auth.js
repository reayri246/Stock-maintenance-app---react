import { apiRequest } from "./api";

export async function loginUser({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutUser() {
  localStorage.removeItem("shopbill_token");
  localStorage.removeItem("shopbill_user");
}
