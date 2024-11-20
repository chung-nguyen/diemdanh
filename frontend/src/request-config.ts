import type { AxiosResponse, RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { request as requestUmi } from 'umi';

import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from './services/ant-design-pro/login';

import defaultSettings from '../config/defaultSettings';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

const isDev = process.env.NODE_ENV === 'development';

let accessToken: string | null = null;
let refreshToken: string | null = null;

let refreshTokenPromise: Promise<AxiosResponse<any>> | null = null;

const refreshAccessToken = async () => {
  if (!refreshToken) {
    refreshToken = getRefreshToken();
  }

  if (refreshToken) {
    return requestUmi('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        token: refreshToken,
      },
    });
  }

  return null;
};


/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const requestConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  baseURL: (isDev ? defaultSettings.devApiUrl : '') + '/' + defaultSettings.apiPath,

  // Request interceptor
  requestInterceptors: [
    (config: RequestOptions) => {
      if (!accessToken) {
        accessToken = getAccessToken();
      }

      if (accessToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    async (response) => {
      const accessTokenExpired = response.status === 401;
      if (accessTokenExpired) {
        try {
          if (!refreshTokenPromise) {
            refreshTokenPromise = refreshAccessToken();
          }

          // multiple requests but "await"ing for only 1 refreshTokenRequest, because of closure
          const res = await refreshTokenPromise;
          if (!res) throw new Error();

          const { data } = res as unknown as AxiosResponse<any>;

          if (data.accessToken) {
            accessToken = data.accessToken as string;
            setAccessToken(accessToken);
          }

          if (data.refreshToken) {
            refreshToken = data.refreshToken as string;
            setRefreshToken(refreshToken);
          }

          return requestUmi(response.config.url!, {
            ...response.config,
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        } catch (err) {
          clearTokens();
          throw err;
        } finally {
          refreshTokenPromise = null;
        }
      }

      return response;
    },
    (response) => {
      // Intercept response data for personalized processing
      const { data } = response as unknown as AxiosResponse<any>;

      if (data.accessToken) {
        accessToken = data.accessToken as string;
        setAccessToken(accessToken);
      }

      if (data.refreshToken) {
        refreshToken = data.refreshToken as string;
        setRefreshToken(refreshToken);
      }

      if (data?.success === false) {
        message.error('Request failed!');
      }
      return response;
    },
  ],
};
