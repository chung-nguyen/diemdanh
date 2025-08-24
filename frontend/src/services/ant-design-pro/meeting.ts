// @ts-ignore
/* eslnumber-disable */
import { request } from '@umijs/max';
import { SortOrder } from 'antd/es/table/numbererface';
import { AttendanceType } from './attendance';

export type MeetingType = {
  _id: string;
  name: string;
  time: Date;
  daysCount: number;
  duration: number;
  createdAt?: Date;
  updatedAt?: Date;
};

/** Get a list of meetings GET /meetings */
export async function meetings(
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
    data: MeetingType[];
    /** The total number of items in the list */
    total?: number;
    success?: boolean;
  }>('/meeting', {
    method: 'GET',
    params: queryParams,
  });
}

/** Get a single meeting GET /meetings/:id */
export async function getMeeting(id: string) {
  const response = await request<{
    data: MeetingType;
    success?: boolean;
  }>(`/meeting/${id}`, {
    method: 'GET',
    params: {},
  });

  return response;
}

/** Get a single meeting GET /meetings/report/:id */
export async function getMeetingReport(id: string) {
  const response = await request<{
    data: { meeting: MeetingType; attendances: AttendanceType[] };
    success?: boolean;
  }>(`/meeting/report/${id}`, {
    method: 'GET',
    params: {},
  });

  return response.data;
}

/** Update meeting PUT /meetings */
export async function updateMeeting(
  data: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<{ success: boolean; data: MeetingType }>(`/meeting/${data._id}`, {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** New meeting POST /meetings */
export async function addMeeting(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<{ success: boolean; data: MeetingType }>('/meeting', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** delete meeting DELETE /meetings */
export async function removeMeetings(data: { ids: string[] }, options?: { [key: string]: any }) {
  return request<{ success: boolean; message: string }>('/meeting', {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function generateInviteSheet(id: string) {
  const response = await request<{
    data: { meeting: MeetingType; attendances: AttendanceType[] };
    success?: boolean;
  }>(`/meeting/generate/${id}`, {
    method: 'GET',
    params: {},
  });

  return response.data;
}

export async function printQRSheet(id: string) {
  const response = await request<{
    data: { meeting: MeetingType; attendances: AttendanceType[] };
    success?: boolean;
  }>(`/meeting/print/${id}`, {
    method: 'GET',
    params: {},
  });

  return response.data;
}

export async function resetMeeting(id: string) {
  const response = await request<{
    data: { meeting: MeetingType; attendances: AttendanceType[] };
    success?: boolean;
  }>(`/meeting/reset/${id}`, {
    method: 'GET',
    params: {},
  });

  return response.data;
}

export async function getCheckInURL() {
  const response = await request<string>('/meeting/checkin-url', {
    method: 'GET',
  });

  return response;
}
