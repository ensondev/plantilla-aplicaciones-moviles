/**
 * Configuración y utilidades de API para el frontend
 */

const API_CONFIG = {
  // Cambiar a la URL de tu backend
  BASE_URL: localStorage.getItem('apiBaseUrl') || 'http://localhost:5555',
  VERSION: 'v1',
  TIMEOUT: 10000
};

/**
 * Obtener URL completa de la API
 * @param {string} endpoint - Ruta del endpoint (ej: 'libros', 'auth/login')
 * @returns {string}
 */
function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}/${endpoint}`;
}

/**
 * Realizar petición HTTP genérica
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones fetch
 * @returns {Promise<object>}
 */
async function apiRequest(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Agregar token si existe
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Error en la solicitud',
        data
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
function apiGet(endpoint) {
  return apiRequest(getApiUrl(endpoint), {
    method: 'GET'
  });
}

/**
 * POST request
 */
function apiPost(endpoint, body) {
  return apiRequest(getApiUrl(endpoint), {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * PUT request
 */
function apiPut(endpoint, body) {
  return apiRequest(getApiUrl(endpoint), {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

/**
 * DELETE request
 */
function apiDelete(endpoint) {
  return apiRequest(getApiUrl(endpoint), {
    method: 'DELETE'
  });
}

/**
 * Prueba la conexión con el backend
 */
async function testConnection() {
  try {
    const data = await apiGet('health');
    return {
      success: true,
      message: 'Conexión exitosa',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message}`,
      error
    };
  }
}

/**
 * Guardar URL del API en localStorage
 */
function setApiBaseUrl(url) {
  const cleanUrl = url.trim().replace(/\/$/, '');
  localStorage.setItem('apiBaseUrl', cleanUrl);
  API_CONFIG.BASE_URL = cleanUrl;
}

/**
 * Obtener URL actual del API
 */
function getApiBaseUrl() {
  return API_CONFIG.BASE_URL;
}
