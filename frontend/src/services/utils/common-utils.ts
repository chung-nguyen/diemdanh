import { requestConfig } from '@/request-config'

export const getCheckInLink = (meetingId: string, guestId: string) => {
  return requestConfig.baseURL;
}
