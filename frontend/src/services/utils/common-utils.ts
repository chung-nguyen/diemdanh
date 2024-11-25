import { requestConfig } from '@/request-config'

export const getCheckInLink = (meetingId: string, guestId: string) => {
  const raw = meetingId + '|' + guestId;
  const code = btoa(raw);
  return requestConfig.baseURL + '/' + code;
}
