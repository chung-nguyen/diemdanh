import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useViewModel } from '../provider/ViewModel';
import { SettingsPanel } from '../containers/SettingsPanel';
import { useDatabaseController } from '../provider/DatabaseController';
import { DatabaseStatusPanel } from '../containers/DatabaseStatusPanel';

export const Home = () => {
  const databaseController = useDatabaseController();

  return (
    <div className="w-full min-h-screen flex items-center bg-base-100">
      <DatabaseStatusPanel />

      <div className="flex flex-1 bg-base-100 justify-center items-center flex-col gap-4">        
        <Link to='/welcome' className="btn btn-primary w-64">
          Chào mừng Đại biểu
        </Link>
        <Link to='/seat-map' className="btn btn-primary w-64">
          Sơ đồ Phòng họp
        </Link>        
        <hr />
        {!databaseController.isRunning && <button type="button" className="btn btn-primary w-64" onClick={() => databaseController.run()}>
          Khởi động Server
        </button>}

        {databaseController.isRunning && <button type="button" className="btn btn-primary w-64" onClick={() => databaseController.stop()}>
          Ngưng Server
        </button>}
      </div>
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <SettingsPanel />
      </div>
    </div>
  );
};
