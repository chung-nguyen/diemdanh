import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useViewModel } from './ViewModel';
import { IPCEvents } from '../../shared/ipcEvents';

type DatabaseControllerContextType = {
  run: () => void;
  stop: () => void;
  isRunning: boolean;
  isConnected: boolean;
};

const DatabaseControllerContext = createContext<DatabaseControllerContextType>({  
  run: () => {},
  stop: () => {},
  isRunning: false,
  isConnected: false
});

export const DatabaseControllerProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { appInfo } = useViewModel();

  const run = () => {
    if (isRunning) {
      return;
    }
    window.electron?.ipcRenderer.sendMessage(IPCEvents.DATABASE, 'start', appInfo.databasePath, appInfo.databasePort);
  }

  const stop = () => {
    window.electron?.ipcRenderer.sendMessage(IPCEvents.DATABASE, 'stop');
  }

  const updateDatabaseStatus = () => {
    window.electron?.ipcRenderer.sendMessage(IPCEvents.DATABASE, 'status');
  }

  useEffect(() => {
    const interval = setInterval(updateDatabaseStatus, 1000);

    const removeIpc = window.electron?.ipcRenderer.on(
      IPCEvents.DATABASE,
      (command: string, isRunning: boolean, isConnected) => {
        switch (command) {
          case 'status':
            setIsRunning(isRunning);
            setIsConnected(isConnected);
            break;
        }        
      },
    );

    return () => {
      removeIpc();
      clearInterval(interval);      
    }
  }, []);

  return (
    <>
      <DatabaseControllerContext.Provider value={{ run, stop, isRunning, isConnected }}>
        {children}
      </DatabaseControllerContext.Provider>
    </>
  );
};

export const useDatabaseController = () => useContext(DatabaseControllerContext);
