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
    isDeleted: false,
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
  }>('/guests', {
    method: 'GET',
    params: queryParams,
  });
}

/** Get a single guest GET /guests/:id */
export async function getGuest(id: bigint) {
  const response = await request<{
    data: GuestType;
    success?: boolean;
  }>(`/guests/${id}`, {
    method: 'GET',
    params: {},
  });

  return response;
}

/** Update guest PUT /guests */
export async function updateGuest(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<{ success: boolean; data: GuestType }>(`/guests/${data.id}`, {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** New guest POST /guests */
export async function addGuest(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<{ success: boolean; data: GuestType }>('/guests', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** delete guest DELETE /guests */
export async function removeGuests(data: { ids: bigint[] }, options?: { [key: string]: any }) {
  return request<{ success: boolean; message: string }>('/guests', {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}
