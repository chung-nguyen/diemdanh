import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppInfoModel } from '../../models/AppInfo';
import { IPCEvents } from '../../shared/ipcEvents';

type ViewModelContextType = {
  appInfo: AppInfoModel;
  qrCode: { code: string };
};

const ViewModelContext = createContext<ViewModelContextType>({
  appInfo: new AppInfoModel(),
  qrCode: { code: '' },
});

export const ViewModelProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [appInfo, setAppInfo] = useState(new AppInfoModel());
  const [qrCode, setQrCode] = useState({ code: '' });

  useEffect(() => {
    const ipcInitDataFinish = window.electron?.ipcRenderer.on(
      IPCEvents.INITIALIZE,
      (appInfo: AppInfoModel) => {
        setAppInfo(new AppInfoModel(appInfo));
      },
    );
    const ipcQrCodeFinish = window.electron?.ipcRenderer.on(
      IPCEvents.QR_CODE,
      (code: string) => {
        setQrCode({ code });
      },
    );

    window.electron?.ipcRenderer.sendMessage(IPCEvents.INITIALIZE, []);

    return () => {
      ipcInitDataFinish();
      ipcQrCodeFinish();
    };
  }, []);

  return (
    <>
      <ViewModelContext.Provider value={{ appInfo, qrCode }}>
        {children}
      </ViewModelContext.Provider>
    </>
  );
};

export const useViewModel = () => useContext(ViewModelContext);
