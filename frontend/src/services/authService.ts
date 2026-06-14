import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_ENDPOINTS } from '@/constants/api';

// ── Token helpers (web uses localStorage, mobile uses SecureStore) ──
export const saveToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('access_token', token);
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('access_token');
  }
  return await SecureStore.getItemAsync('access_token');
};

export const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
  } else {
    await SecureStore.deleteItemAsync('access_token');
  }
};

// ── Base fetch helper ──────────────────────
const post = async (url: string, body: object) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Something went wrong');
  return data;
};

// ── Auth functions ─────────────────────────
export const registerBasicInfo = (
  name: string,
  email: string,
  citizenship_number: string,
  citizenship_photo_url?: string
) => post(AUTH_ENDPOINTS.basicInfo, { 
  name, 
  email, 
  citizenship_number,
  ...(citizenship_photo_url && { citizenship_photo_url })
});

export const registerPhone = (
  registration_id: string,
  phone: string
) => post(AUTH_ENDPOINTS.phone, { registration_id, phone });

export const verifyPhone = (
  registration_id: string,
  code: string
) => post(AUTH_ENDPOINTS.verifyPhone, { registration_id, code });

export const sendEmailOtp = async (registration_id: string) => {
  const response = await fetch(
    `${AUTH_ENDPOINTS.sendEmailOtp}?registration_id=${registration_id}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to send email OTP');
};

export const verifyEmail = (
  registration_id: string,
  code: string
) => post(AUTH_ENDPOINTS.verifyEmail, { registration_id, code });

export const finalizeRegistration = (
  registration_id: string,
  password: string,
  confirm_password: string
) => post(AUTH_ENDPOINTS.finalize, { registration_id, password, confirm_password });

export const loginUser = (
  email: string,
  password: string
) => post(AUTH_ENDPOINTS.login, { email, password });

export const verify2FA = (
  login_token: string,
  method: string,
  code: string
) => post(AUTH_ENDPOINTS.verify2fa, { login_token, method, code });