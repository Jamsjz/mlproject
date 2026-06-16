import { USER_ENDPOINTS, REPORT_ENDPOINTS } from '@/constants/api';
import { getToken } from './authService';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'API request failed');
  }
  
  return data;
};

export const getMyProfile = () => fetchWithAuth(USER_ENDPOINTS.me);

export const getMyReports = () => fetchWithAuth(REPORT_ENDPOINTS.me);

export const getRecentReports = () => fetchWithAuth(REPORT_ENDPOINTS.recent);

export const createReport = (reportData: {
  category: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}) => fetchWithAuth(REPORT_ENDPOINTS.base, {
  method: 'POST',
  body: JSON.stringify(reportData),
});
