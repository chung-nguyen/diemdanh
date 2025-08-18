import { useEffect, useRef, useState } from 'react';
import { useViewModel } from '../provider/ViewModel';

import welcomeBgImage from '../../../assets/images/welcomebg.png'

type GuestData = {
  attendTime: string;
  code: string;
  guestID: string;
  guestImageURL: string;
  guestName: string;
  guestOffice: string;
  isCheckedIn: boolean;
  meetingName: string;
};

export const Welcome = () => {
  const { appInfo, qrCode } = useViewModel();

  const [currentQrCode, setCurrentQrCode] = useState('');
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const currentTime = useRef(0);

  const loadQrCodeData = async (code: string) => {
    try {
      currentTime.current = Date.now();
      const response = await fetch(`${appInfo.serverAddress}/welcome/${code}`);

      const result = await response.json();      
      if (result.status !== 'error') {
        setGuestData(result);      
      }
    } catch (ex) {
      console.error(ex);
    }
  };

  const updateClearData = () => {
    if (Date.now() - currentTime.current > 10000) {
      currentTime.current = Date.now();
      setCurrentQrCode('');
      setGuestData(null);
    }
  };

  useEffect(() => {
    if (qrCode.code && (qrCode.code !== currentQrCode || guestData === null)) {
      currentTime.current = Date.now();
      setCurrentQrCode(qrCode.code);
      loadQrCodeData(qrCode.code);
    }
  }, [qrCode]);

  useEffect(() => {
    const interval = setInterval(updateClearData, 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  const today = new Date();

  return (
    <div className="container mx-auto flex items-center justify-start h-full">
      <div className="absolute top-0 left-0 w-screen h-screen">
        <figure className="w-full h-full">
          <img
            src={welcomeBgImage}
            alt="Background"
            className="object-contain w-full h-full"
          />
        </figure>
      </div>

      <div className="absolute top-0 left-0 w-screen h-screen flex">
        <div className="flex w-full h-full flex-col items-center p-8 gap-4">
          <h1 className="font-times font-bold text-7xl text-yellow-300 text-shadow-lg">
            ĐẠI HỘI ĐẠI BIỂU ĐẢNG BỘ PHƯỜNG BÌNH QUỚI
          </h1>
          <h1 className="font-times font-bold text-7xl text-yellow-300 text-shadow-lg">
            LẦN THỨ I, NHIỆM KỲ 2025-2030
          </h1>

          <div className="flex-1"></div>

          {guestData && (
            <div className="flex flex-col items-center gap-10">
              <h1 className="font-times font-bold text-7xl text-red-600 text-shadow-lg">
                ĐỒNG CHÍ
              </h1>
              <h1 className="font-times font-bold text-9xl text-red-600 text-shadow-lg">
                {guestData.guestName}
              </h1>
              <h1 className="font-times font-bold text-6xl text-red-600 text-shadow-lg">
                {guestData.guestOffice}
              </h1>
            </div>
          )}

          <div className="flex-1"></div>

          <div className='h-16'></div>

          <h1 className="font-times font-bold italic text-7xl text-yellow-300 text-shadow-lg">
            Bình Quới, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
          </h1>

          <div className='h-18'></div>
        </div>
      </div>
    </div>
  );
};
