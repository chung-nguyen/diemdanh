import { CHECKIN_BASEURL, PHOTO_BASE_URL, requestConfig } from '@/request-config';

export const getCheckInLink = (attendanceId: string) => {
  const code = encodeURIComponent(btoa(attendanceId));
  return CHECKIN_BASEURL + '/' + code;
};

export const getPhotoURL = (filePath: string) => {
  return PHOTO_BASE_URL + '/' + filePath;
}
