import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private getHeaders(requiresAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = localStorage.getItem('mi_boleta_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    let body: any;
    try {
      body = await response.json();
    } catch (e) {
      body = { error: 'Error al procesar la respuesta del servidor' };
    }

    if (!response.ok) {
      // Si el token expira o es inválido
      if (response.status === 401) {
        localStorage.removeItem('mi_boleta_token');
        localStorage.removeItem('mi_boleta_user');
        // Redirigir a login si estamos en el cliente y no en la página de login/registro
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login?expired=true';
        }
      }

      throw new Error(body.error || 'Ha ocurrido un error inesperado');
    }

    return body as T;
  }

  public async get<T>(path: string, requiresAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(requiresAuth),
    });
    return this.handleResponse<T>(response);
  }

  public async post<T>(path: string, data: any, requiresAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(requiresAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  public async put<T>(path: string, data: any, requiresAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(requiresAuth),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  public async delete<T>(path: string, requiresAuth: boolean = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(requiresAuth),
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();

/**
 * Parsea los errores de validación del backend del formato:
 * "Datos inválidos: email: El email no es válido; password: La contraseña debe tener al menos 8 caracteres"
 * A un objeto estructurado: { email: "El email no es válido", password: "La contraseña debe tener al menos 8 caracteres" }
 */
export function parseValidationError(errorMsg: string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!errorMsg.startsWith('Datos inválidos:')) {
    return { general: errorMsg };
  }

  // Eliminar prefijo "Datos inválidos: "
  const content = errorMsg.replace('Datos inválidos:', '').trim();
  
  // Dividir por ";"
  const parts = content.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Buscar el primer ":" que separa el nombre del campo de su mensaje
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      const field = trimmed.substring(0, colonIndex).trim();
      const message = trimmed.substring(colonIndex + 1).trim();
      errors[field] = message;
    } else {
      errors['general'] = trimmed;
    }
  }

  return errors;
}
