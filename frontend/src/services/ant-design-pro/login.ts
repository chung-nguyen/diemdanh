// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EDITOR = 'EDITOR',
  PURCHASE = 'PURCHASE',
  FULFILL = 'FULFILL',
  ACCOUNTANT = 'ACCOUNTANT',
  USER = 'USER'
}

export function clearTokens () {
  localStorage.removeItem('access-token');
  localStorage.removeItem('refresh-token');
}

export function getAccessToken (): string {
  const accessToken = localStorage.getItem('access-token') || '';
  return accessToken;
}

export function getRefreshToken (): string {
  const refreshToken = localStorage.getItem('refresh-token') || '';
  return refreshToken;
}

export function setAccessToken (accessToken: string) {
  localStorage.setItem('access-token', accessToken);
}

export function setRefreshToken (refreshToken: string) {
  localStorage.setItem('refresh-token', refreshToken);
}

/** Send the verification code POST /api/login/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/api/login/captcha', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
