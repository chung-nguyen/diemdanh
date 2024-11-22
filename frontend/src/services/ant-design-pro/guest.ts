// @ts-ignore
/* eslnumber-disable */
import { request } from '@umijs/max';
import { SortOrder } from 'antd/es/table/numbererface';

export type GuestType = {
  _id: string;
  email: string;
  fullName: string;
  office: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/** Get a list of guests GET /guests */
export async function guests(
  params: {
    pageSize?: number;
    current?: number;
    keyword?: string;
  },
  sort: Record<string, SortOrder>,
  filter: Record<string, (string | number)[] | null>,
) {
  const queryParams: any = {
    ...params,
    ...filter,
  };

  if (sort) {
    const sortEntry = Object.entries(sort)[0];
    if (sortEntry) {
      queryParams.sort = sortEntry[0];
      queryParams.direction = sortEntry[1];
    }
  }

  return request<{
    data: GuestType[];
    /** The total number of items in the list */
    total?: number;
    success?: boolean;
  }>('/guest', {
    method: 'GET',
    params: queryParams,
  });
}

/** Get a single guest GET /guests/:id */
export async function getGuest(id: string) {
  const response = await request<{
    data: GuestType;
    success?: boolean;
  }>(`/guest/${id}`, {
    method: 'GET',
    params: {},
  });

  return response;
}

/** Update guest PUT /guests */
export async function updateGuest(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<{ success: boolean; data: GuestType }>(`/guest/${data._id}`, {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** New guest POST /guests */
export async function addGuest(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<{ success: boolean; data: GuestType }>('/guest', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** delete guest DELETE /guests */
export async function removeGuests(data: { ids: string[] }, options?: { [key: string]: any }) {
  return request<{ success: boolean; message: string }>('/guest', {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function search(query: string, limit: number, options?: { [key: string]: any }) {
  const response = await request<GuestType[]>('/guest/search', {
    params: {      
      q: query,      
      c: limit,
    },
    method: 'GET',
    ...(options || {}),
  });

  return response;
}