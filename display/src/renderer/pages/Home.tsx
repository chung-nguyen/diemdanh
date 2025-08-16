import { useEffect, useState } from 'react';

import { useViewModel } from '../provider/ViewModel';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [port, setPort] = useState(5005);
  const [serverAddress, setServerAddress] = useState('http://localhost:5000');
  const [meetingId, setMeetingId] = useState('');

  const { appInfo } = useViewModel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    appInfo.localPort = port;
    appInfo.serverAddress = serverAddress;
    appInfo.meetingId = meetingId;

    window.electron?.ipcRenderer.sendMessage('save-data', appInfo);
  }; 

  useEffect(() => {
    setPort(appInfo.localPort);
    setServerAddress(appInfo.serverAddress);
    setMeetingId(appInfo.meetingId);
  }, [appInfo]);

  return (
    <div className="w-full min-h-screen flex items-center bg-base-100">
      <div className="flex flex-1 bg-base-100 justify-center items-center flex-col gap-4">        
        <Link to='/welcome' className="btn btn-primary w-64">
          Chào mừng Đại biểu
        </Link>
        <Link to='/seat-map' className="btn btn-primary w-64">
          Sơ đồ Phòng họp
        </Link>        
      </div>
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Cài đặt</h2>

            <form onSubmit={handleSubmit} className="flex flex-col form-control gap-4">
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
      </div>
    </div>
  );
};
