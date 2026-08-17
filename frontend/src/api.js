const SESSION_KEY = "carx-session";
const LEGACY_SESSION_KEY = "oldmarket-session";
export const markSession = () => {
  sessionStorage.setItem(SESSION_KEY, "1");
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
};
export const hasSession = () =>
  [SESSION_KEY, LEGACY_SESSION_KEY].some((key) => sessionStorage.getItem(key) === "1");
export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
  fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
  window.dispatchEvent(new Event("auth-changed"));
};
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
async function request(path, options = {}) {
  const { timeout = 15000, ...fetchOptions } = options,
    controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), timeout),
    authenticated = !path.startsWith("/api/v1/auth/"),
    isAuthProbe =
      path === "/api/v1/users/me" || path === "/api/v1/notifications";
  try {
    const response = await fetch(path, {
      ...fetchOptions,
      credentials: "same-origin",
      signal: controller.signal,
      headers: {
        ...fetchOptions.headers,
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (
        response.status === 401 ||
        (authenticated && response.status === 403 && isAuthProbe)
      ) {
        logout();
        throw new ApiError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          401,
        );
      }
      if (response.status === 403)
        throw new ApiError(
          body?.detail || body?.message || "Bạn không có quyền thực hiện thao tác này.",
          403,
        );
      throw new ApiError(
        body?.detail || body?.message || "Không thể xử lý yêu cầu.",
        response.status,
      );
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error.name === "AbortError")
      throw new ApiError("Kết nối quá lâu. Vui lòng thử lại.", 408);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
export const newestListings = () => request("/api/v1/listings");
export const categories = () => request("/api/v1/categories");
export const locations = () => request("/api/v1/locations");
export const myListings = () => request("/api/v1/listings/mine");
export const me = () => request("/api/v1/users/me");
export const user = (id) => request(`/api/v1/users/${id}`);
export const updateUser = (id, displayName) =>
  request(`/api/v1/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
export const changePassword = (currentPassword, newPassword) =>
  request("/api/v1/auth/password-changes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
export const searchListings = (params) =>
  request(
    `/api/v1/listings?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null))}`,
  );
export const vehicleCatalog = () => request("/api/v1/vehicle-catalog");
export const vehicleModels = (brandId) =>
  request(`/api/v1/vehicle-catalog/brands/${brandId}/models`);
export const listingRecommendations = (params) =>
  request(
    `/api/v1/listings/recommendations?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null))}`,
  );
export const listing = (id) => request(`/api/v1/listings/${id}`);
export const images = (id) => request(`/api/v1/listings/${id}/images`);
export const storageHealth = () => request("/api/v1/storage/health");
export const comments = (id) => request(`/api/v1/listings/${id}/comments`);
export const addComment = (id, body) =>
  request(`/api/v1/listings/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
export const uploadImage = (id, file) => {
  const body = new FormData();
  body.append("file", file);
  return request(`/api/v1/listings/${id}/images`, { method: "POST", body });
};
export const deleteImage = (listingId, mediaId) =>
  request(`/api/v1/listings/${listingId}/images/${mediaId}`, {
    method: "DELETE",
  });
export const reportListing = (id, reasonId, details) =>
  request(`/api/v1/listings/${id}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reasonId, details }),
  });
export const openConversation = (id) =>
  request(`/api/v1/listings/${id}/conversations`, { method: "POST" });
export const conversations = () => request("/api/v1/conversations");
export const conversationMessages = (id) =>
  request(`/api/v1/conversations/${id}/messages`);
export const sendMessage = (id, body) =>
  request(`/api/v1/conversations/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
export const followSeller = (id) =>
  request(`/api/v1/sellers/${id}/follow`, { method: "POST" });
export const sellerTrust = (id) => request(`/api/v1/sellers/${id}/trust-score`);
export const savedListingIds = () => request("/api/v1/saved-listings/ids");
export const saveListing = (id) =>
  request(`/api/v1/listings/${id}/saved`, { method: "POST" });
export const unsaveListing = (id) =>
  request(`/api/v1/listings/${id}/saved`, { method: "DELETE" });
export const requestPasswordReset = (email) =>
  request("/api/v1/auth/password-reset-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
export const notifications = () => request("/api/v1/notifications");
export const readNotification = (id) =>
  request(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
export const myTransactions = () => request("/api/v1/transactions/mine");
export const confirmTransaction = (listingId, buyerUserId) =>
  request(`/api/v1/listings/${listingId}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buyerUserId }),
  });
export const confirmReceipt = (id) =>
  request(`/api/v1/transactions/${id}/confirm`, { method: "POST" });
export const createReview = (id, rating, body) =>
  request(`/api/v1/transactions/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: Number(rating), body }),
  });
export const adminReports = () => request("/api/v1/admin/reports");
export const adminStats = () => request("/api/v1/admin/stats");
const adminParams = (params) =>
  new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
export const adminUsers = (params = {}) =>
  request(`/api/v1/admin/users?${adminParams(params)}`);
export const adminSuspendUser = (id) =>
  request(`/api/v1/admin/users/${id}/suspend`, { method: "PATCH" });
export const adminActivateUser = (id) =>
  request(`/api/v1/admin/users/${id}/activate`, { method: "PATCH" });
export const adminListings = (params = {}) =>
  request(`/api/v1/admin/listings?${adminParams(params)}`);
export const adminRestoreListing = (id) =>
  request(`/api/v1/admin/listings/${id}/restore`, { method: "PATCH" });
export const adminArchive = (id) =>
  request(`/api/v1/admin/listings/${id}/archive`, { method: "PATCH" });
export const adminDismissReport = (id) =>
  request(`/api/v1/admin/reports/${id}/dismiss`, { method: "PATCH" });
export const adminArchiveReport = (id) =>
  request(`/api/v1/admin/reports/${id}/archive`, { method: "PATCH" });
export const adminCategories = () => request("/api/v1/admin/categories");
export const adminCreateCategory = (data) =>
  request("/api/v1/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const adminUpdateCategory = (id, data) =>
  request(`/api/v1/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const adminVehicleCatalog = () =>
  request("/api/v1/admin/vehicle-catalog");
export const adminCreateVehicleOption = (resource, data) =>
  request(`/api/v1/admin/vehicle-catalog/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const adminUpdateVehicleOption = (resource, id, data) =>
  request(`/api/v1/admin/vehicle-catalog/${resource}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const adminActivateVehicleOption = (resource, id) =>
  request(`/api/v1/admin/vehicle-catalog/${resource}/${id}/activate`, {
    method: "PATCH",
  });
export const adminDeactivateVehicleOption = (resource, id) =>
  request(`/api/v1/admin/vehicle-catalog/${resource}/${id}/deactivate`, {
    method: "PATCH",
  });
export const adminLocations = (params = {}) =>
  request(`/api/v1/admin/locations?${adminParams(params)}`);
export const adminActivateLocation = (id) =>
  request(`/api/v1/admin/locations/${id}/activate`, { method: "PATCH" });
export const adminDeactivateLocation = (id) =>
  request(`/api/v1/admin/locations/${id}/deactivate`, { method: "PATCH" });
export const adminOperationsStats = () =>
  request("/api/v1/admin/operations/stats");
export const adminTransactions = (params = {}) =>
  request(`/api/v1/admin/transactions?${adminParams(params)}`);
export const adminReviews = (params = {}) =>
  request(`/api/v1/admin/reviews?${adminParams(params)}`);
export const adminHideReview = (id) =>
  request(`/api/v1/admin/reviews/${id}/hide`, { method: "PATCH" });
export const adminRestoreReview = (id) =>
  request(`/api/v1/admin/reviews/${id}/restore`, { method: "PATCH" });
export const adminSendNotification = (data) =>
  request("/api/v1/admin/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const adminAuditLogs = (params = {}) =>
  request(`/api/v1/admin/audit-logs?${adminParams(params)}`);
export const adminHealth = () => request("/api/v1/admin/health");
export const adminRoles = () => request("/api/v1/admin/roles");
export const adminPermissions = () => request("/api/v1/admin/permissions");
export const adminUpdateUserRoles = (id, roleCodes) =>
  request(`/api/v1/admin/users/${id}/roles`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roleCodes }),
  });
export const login = (email, password) =>
  request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      captchaToken: window.turnstile?.getResponse?.(),
    }),
  }).then(
    (data) => (
      markSession(),
      window.dispatchEvent(new Event("auth-changed")),
      data
    ),
  );
export const createListing = (data) =>
  request("/api/v1/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const updateListing = (id, data) =>
  request(`/api/v1/listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const archiveListing = (id) =>
  request(`/api/v1/listings/${id}`, { method: "DELETE" });
export const register = (displayName, email, password) =>
  request("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName,
      email,
      password,
      captchaToken: window.turnstile?.getResponse?.(),
    }),
  }).then(
    (data) => (
      markSession(),
      window.dispatchEvent(new Event("auth-changed")),
      data
    ),
  );
