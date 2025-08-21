import { useEffect, useState } from 'react';

import { useViewModel } from '../provider/ViewModel';
import { IPCEvents } from '../../shared/ipcEvents';

export const SettingsPanel = () => {
  const [port, setPort] = useState(5005);
  const [serverAddress, setServerAddress] = useState('http://localhost:5000');
  const [meetingId, setMeetingId] = useState('');
  const [databasePath, setDatabasePath] = useState('');
  const [databasePort, setDatabasePort] = useState(27017);

  const { appInfo } = useViewModel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    appInfo.localPort = port;
    appInfo.serverAddress = serverAddress;
    appInfo.meetingId = meetingId;
    appInfo.databasePath = databasePath;
    appInfo.databasePort = databasePort;

    window.electron?.ipcRenderer.sendMessage(IPCEvents.SAVE_SETTINGS, appInfo);
  };

  useEffect(() => {
    setPort(appInfo.localPort);
    setServerAddress(appInfo.serverAddress);
    setMeetingId(appInfo.meetingId);
    setDatabasePath(appInfo.databasePath);
    setDatabasePort(appInfo.databasePort);
  }, [appInfo]);

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Cài đặt</h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col form-control gap-4"
        >
          {/* IP Address */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">IP Address</span>
            </div>
            <input
              type="text"
              readOnly
              className="input input-bordered"
              value={appInfo.localIpAddress}
              required
            />
          </label>

          {/* Port */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">Port</span>
            </div>
            <input
              type="number"
              className="input input-bordered"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
              required
            />
          </label>

          <hr />
          {/* Database path */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">Đường dẫn đến database</span>
            </div>
            <input
              className="input input-bordered"
              value={databasePath}
              onChange={(e) => setDatabasePath(e.target.value)}
              required
            />
          </label>

          {/* Database port */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">Port database</span>
            </div>
            <input
              type="number"
              className="input input-bordered"
              value={port}
              onChange={(e) => setDatabasePort(parseInt(e.target.value))}
              required
            />
          </label>

          {/* Server address */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">Địa chỉ server</span>
            </div>
            <input
              className="input input-bordered"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              required
            />
          </label>

          {/* Meeting ID */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">Meeting ID</span>
            </div>
            <input
              className="input input-bordered"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              required
            />
          </label>

          {/* Submit */}
          <div className="card-actions justify-end mt-4">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
