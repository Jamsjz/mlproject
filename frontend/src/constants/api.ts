export const API_BASE_URL = 'http://127.0.0.1:8000';

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