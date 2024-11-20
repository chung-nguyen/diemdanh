import { ColumnsState } from '@ant-design/pro-components';
import { TablePaginationConfig } from 'antd';

export function tableColumnState(
  key: string,
  state: Record<string, ColumnsState>,
  setState: Function,
): any {
  return {
    value: state,
    onChange: (map: Record<string, ColumnsState>) => {
      if (JSON.stringify(map) !== JSON.stringify(state)) {
        setState(map);
        localStorage.setItem(key, JSON.stringify(map));
      }
    },
    persistenceKey: key,
    persistenceType: 'localStorage',
  };
}

export function paginationOption(storageKey: string, pageSizeOptions: number[]): TablePaginationConfig {
  return {
    pageSizeOptions,
    showSizeChanger: true,
    showQuickJumper: true,
    defaultPageSize: parseInt(localStorage.getItem(storageKey) || pageSizeOptions[0].toString()),    
    onShowSizeChange: (current: number, size: number) => {
      localStorage.setItem(storageKey, size.toString());
    },
  }
}

export function expandFormData(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(fields)) {
    const subKeys = key.split('.');
    if (subKeys.length === 1) {
      result[key] = value;
      continue;
    }

    let subObj = result;
    for (let i = 0; i < subKeys.length - 1; ++i) {
      const subKey = subKeys[i];
      if (!subObj[subKey]) {
        subObj[subKey] = {};
      }
      subObj = subObj[subKey];
    }

    subObj[subKeys[subKeys.length - 1]] = value;
  }

  return result;
}

export function flattenFormData(
  obj?: Record<string, any>,
  prefix: string = '',
): Record<string, any> {
  if (!obj) {
    return {};
  }

  let flattened: Record<string, any> = {};
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(flattened, flattenFormData(obj[key], prefix + key + '.'));
    } else {
      flattened[prefix + key] = obj[key];
    }
  }
  return flattened;
}

export function createConnectQuery(
  current: number[],
  update: number[],
): Record<string, any> | undefined {
  current = current || [];
  update = update || [];

  if (!current.length && !update.length) {
    return undefined;
  }

  const result: Record<string, any> = {};
  current = current.filter((id) => !update.includes(id));
  if (current.length) {
    result.disconnect = current.map((id) => ({ id }));
  }

  if (update.length) {
    result.createOrConnect = {
      product: {
        connect: update.map((id) => ({ id })),
        position: 0
      },
    };
  }

  return result;
}

export function isEmptyObject(x: any): boolean {
  if (Array.isArray(x)) {
    return !x.length;
  }

  if (x && x.toNumber) {
    return x.toNumber() === 0;
  }

  return !x;
}
