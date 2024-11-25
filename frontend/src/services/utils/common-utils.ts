import { CHECKIN_BASEURL, requestConfig } from '@/request-config';

export const getCheckInLink = (attendanceId: string) => {
  const code = encodeURIComponent(btoa(attendanceId));
  return CHECKIN_BASEURL + '/' + code;
};
