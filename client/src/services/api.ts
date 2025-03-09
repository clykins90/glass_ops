const API_URL = 'http://localhost:3001/api';

// Generic fetch function with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Customer API
export const customerApi = {
  getAll: () => fetchApi<any[]>('/customers'),
  getById: (id: number) => fetchApi<any>(`/customers/${id}`),
  create: (data: any) => fetchApi<any>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchApi<any>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchApi<any>(`/customers/${id}`, {
    method: 'DELETE',
  }),
  getWorkOrders: (id: number) => fetchApi<any[]>(`/customers/${id}/workorders`),
  getVehicles: (id: number) => fetchApi<any[]>(`/customers/${id}/vehicles`),
};

// Vehicle API
export const vehicleApi = {
  getAll: () => fetchApi<any[]>('/vehicles'),
  getById: (id: number) => fetchApi<any>(`/vehicles/${id}`),
  create: (data: any) => fetchApi<any>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchApi<any>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchApi<any>(`/vehicles/${id}`, {
    method: 'DELETE',
  }),
};

// Work Order API
export const workOrderApi = {
  getAll: () => fetchApi<any[]>('/workorders'),
  getById: (id: number) => fetchApi<any>(`/workorders/${id}`),
  create: (data: any) => fetchApi<any>('/workorders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchApi<any>(`/workorders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchApi<any>(`/workorders/${id}`, {
    method: 'DELETE',
  }),
};

// Technician API
export const technicianApi = {
  getAll: () => fetchApi<any[]>('/technicians'),
  getById: (id: number) => fetchApi<any>(`/technicians/${id}`),
  create: (data: any) => fetchApi<any>('/technicians', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchApi<any>(`/technicians/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchApi<any>(`/technicians/${id}`, {
    method: 'DELETE',
  }),
}; 