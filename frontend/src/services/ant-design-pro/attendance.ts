// @ts-ignore
/* eslnumber-disable */
import { request } from '@umijs/max';
import { SortOrder } from 'antd/es/table/numbererface';
import { GuestType } from './guest';

export enum AttendanceStatus {
  UNKNOWN = 0,
  CHECKED_IN = 1,
}

export const AttedanceStatusOptions = [
  {
    label: 'Chưa tham dự',
    value: 0
  },
  {
    label: 'Đã tham dự',
    value: 1
  },
]

export type AttendanceType = {
  _id: string;
  meetingId: string;
  seat: number;
  day: number;
  guestId: string | GuestType;
  status: AttendanceStatus;
  checkInTime: Date;
};

/** Get a list of attendances GET /attendances */
export function attendances(meetingId: string, day: string) {
  return async (
    params: {
      pageSize?: number;
      current?: number;
      keyword?: string;
    },
    sort: Record<string, SortOrder>,
    filter: Record<string, (string | number)[] | string | null>,
  ) => {
    filter = filter || {};
    filter.meetingId = meetingId;
    filter.day = day;

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
      data: AttendanceType[];
      /** The total number of items in the list */
      total?: number;
      success?: boolean;
    }>('/attendance', {
      method: 'GET',
      params: queryParams,
    });
  };
}

/** Get a single attendance GET /attendances/:id */
export async function getAttendance(id: string) {
  const response = await request<{
    data: AttendanceType;
    success?: boolean;
  }>(`/attendance/${id}`, {
    method: 'GET',
    params: {},
  });

  return response;
}

/** Update attendance PUT /attendances */
export async function updateAttendance(
  data: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<{ success: boolean; data: AttendanceType }>(`/attendance/${data._id}`, {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** New attendance POST /attendances */
export async function addAttendance(
  data: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<{ success: boolean; data: AttendanceType }>('/attendance', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** delete attendance DELETE /attendances */
export async function removeAttendances(data: { ids: string[] }, options?: { [key: string]: any }) {
  return request<{ success: boolean; message: string }>('/attendance', {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}
