import { API_BASE_URL, PHOTO_BASE_URL } from '@/request-config';
import { AttendanceType } from '../ant-design-pro/attendance';

export const getAPIURL = (pathName: string) => {
  return API_BASE_URL + '/' + pathName;
};

export const getPhotoURL = (filePath: string) => {
  return PHOTO_BASE_URL + '/' + filePath;
};

export const buildCheckInURL = (baseURL: string, attendance: AttendanceType) => {
  const blob = encodeURIComponent(btoa(attendance._id));
  const blob0 = encodeURIComponent(btoa(attendance.guestId));
  return baseURL + '/' + blob0 + '/' + blob;
}
