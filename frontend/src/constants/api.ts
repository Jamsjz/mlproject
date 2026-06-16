import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getBaseUrl();

export const AUTH_ENDPOINTS = {
  basicInfo:    `${API_BASE_URL}/api/auth/register/basic-info`,
  phone:        `${API_BASE_URL}/api/auth/register/phone`,
  verifyPhone:  `${API_BASE_URL}/api/auth/register/verify-phone`,
  sendEmailOtp: `${API_BASE_URL}/api/auth/register/send-email-otp`,
  verifyEmail:  `${API_BASE_URL}/api/auth/register/verify-email`,
  finalize:     `${API_BASE_URL}/api/auth/register/finalize`,
  login:        `${API_BASE_URL}/api/auth/login`,
  verify2fa:    `${API_BASE_URL}/api/auth/login/2fa/verify`,
};

export const USER_ENDPOINTS = {
  me: `${API_BASE_URL}/api/users/me`,
};

export const REPORT_ENDPOINTS = {
  base: `${API_BASE_URL}/api/reports`,
  me: `${API_BASE_URL}/api/reports/me`,
  recent: `${API_BASE_URL}/api/reports/recent`,
};