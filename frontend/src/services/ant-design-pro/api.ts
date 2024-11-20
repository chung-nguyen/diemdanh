// @ts-ignore
/* eslint-disable */
import { request, useModel } from '@umijs/max';

import { clearTokens, getAccessToken } from './login';

/** 获取当前的用户 GET /auth */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    me: API.CurrentUser;
  }>('/auth', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Just clean up */
export async function outLogin(options?: { [key: string]: any }) {
  clearTokens();
  window.location.href = '/';
}

/** POST /auth */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

export function useServiceProviders () {
  const { initialState } = useModel('@@initialState');

  const getMediaUrl = (src?: string): string => {
    if (src?.startsWith('http:') || src?.startsWith('data:')) {
      return src;
    }

    const settings = (initialState?.settings! as any);
    if (initialState?.isDev) {
      return settings.devApiUrl + '/media/' + src;
    }

    if (settings.absApiUrl) {
      return settings.absApiUrl + '/media/' + src;
    }

    return '/media/' + src;
  }

  const getApiUrl = (path?: string): string => {
    if (path?.startsWith('http:') || path?.startsWith('data:')) {
      return path;
    }

    const settings = (initialState?.settings! as any);
    if (initialState?.isDev) {
      return settings.devApiUrl + path;
    }

    if (settings.absApiUrl) {
      return settings.absApiUrl + path;
    }

    return path || '/';
  }

  const getApiHeaders = (): Record<string, string> => {
    const accessToken = getAccessToken();

    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return {};
  }

  return { initialState, getMediaUrl, getApiUrl, getApiHeaders };
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}
