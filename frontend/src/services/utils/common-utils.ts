import { API_BASE_URL, PHOTO_BASE_URL } from '@/request-config';

export const getAPIURL = (pathName: string) => {
  return API_BASE_URL + '/' + pathName;
};

export const getPhotoURL = (filePath: string) => {
  return PHOTO_BASE_URL + '/' + filePath;
};
