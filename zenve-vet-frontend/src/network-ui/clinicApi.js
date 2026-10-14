const BASE = 'http://localhost:8080/api';

async function call(path, options) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server');
  }
  if (!res.ok) {
    let message = 'Something went wrong';
    try {
      const data = await res.json();
      message = data.fieldErrors?.[0]?.message || data.message || message;
    } catch {
      // Use the fallback message when the response body is not JSON.
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const getClinics = (vetId) => call(`/vets/${vetId}/clinics`);

export const createClinic = (vetId, form) =>
  call(`/vets/${vetId}/clinics`, { method: 'POST', body: JSON.stringify(form) });

export const updateClinic = (id, form) =>
  call(`/clinics/${id}`, { method: 'PUT', body: JSON.stringify(form) });

export const deleteClinic = (id) => call(`/clinics/${id}`, { method: 'DELETE' });
