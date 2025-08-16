import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AppInfoModel } from '../../models/AppInfo';

type ViewModelContextType = {
  appInfo: AppInfoModel
};

const ViewModelContext = createContext<ViewModelContextType>({
  appInfo: new AppInfoModel()
});

export const ViewModelProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [appInfo, setAppInfo] = useState(new AppInfoModel());

  useEffect(() => {
    const ipcRemove = window.electron?.ipcRenderer.on('init-data', (appInfo: AppInfoModel) => {
      setAppInfo(new AppInfoModel(appInfo));
    });
    window.electron?.ipcRenderer.sendMessage('init-data', []);

    return () => {
      ipcRemove();
    };
  }, []);

  return (
    <>
      <ViewModelContext.Provider value={{ appInfo }}>
        {children}
      </ViewModelContext.Provider>
    </>
  );
};

export const useViewModel = () => useContext(ViewModelContext);
