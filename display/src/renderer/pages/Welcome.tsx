import { useEffect, useState } from 'react';
import { useViewModel } from '../provider/ViewModel';

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

  const loadQrCodeData = async (code: string) => {
    try {
      const response = await fetch(`${appInfo.serverAddress}/welcome/${code}`);

      const result = await response.json();
      setGuestData(result);
    } catch (ex) {
      console.error(ex);
    }
  };

  const clearData = () => {
    setCurrentQrCode('');
    setGuestData(null);
  }

  useEffect(() => {
    if (qrCode !== currentQrCode) {
      setCurrentQrCode(qrCode);
      loadQrCodeData(qrCode);

      setTimeout(() => clearData(), 5000);
    }
  }, [qrCode]);

  return (
    <div className="container mx-auto flex items-center justify-start h-full">
      <div className="absolute top-0 left-0 w-screen h-screen">
        <figure className="w-full h-full">
          <img
            src="/images/welcomebg.jpg"
            alt="Background"
            className="object-contain w-full h-full"
          />
        </figure>
      </div>

      <div className="absolute top-0 left-0 w-screen h-screen flex">
        <div className="flex w-full h-full flex-col items-center p-8 gap-4">
          <h1 className="font-times font-bold text-7xl text-yellow-300">
            ĐẠI HỘI ĐẠI BIỂU ĐẢNG BỘ PHƯỜNG BÌNH QƯỚI
          </h1>
          <h1 className="font-times font-bold text-7xl text-yellow-300">
            LẦN THỨ I, NHIỆM KỲ 2025-2030
          </h1>

          <div className="flex-1"></div>

          {guestData && <div className='flex flex-col items-center gap-4'>
            <h1 className="font-times font-bold text-7xl text-red-600">ĐỒNG CHÍ</h1>
            <h1 className="font-times font-bold text-7xl text-red-600">{guestData.guestName}</h1>
            <h1 className="font-times font-bold text-7xl text-red-600">{guestData.guestOffice}</h1>
          </div>}

          <div className="flex-1"></div>

          <h1 className="font-times font-bold italic text-7xl text-yellow-300">
            Bình Quới, ngày 20 tháng 8 năm 2025
          </h1>
        </div>
      </div>
    </div>
  );
};
