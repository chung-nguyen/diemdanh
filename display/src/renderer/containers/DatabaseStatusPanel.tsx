import { useEffect, useState } from 'react';

import { useViewModel } from '../provider/ViewModel';
import { IPCEvents } from '../../shared/ipcEvents';
import { useDatabaseController } from '../provider/DatabaseController';

export const DatabaseStatusPanel = () => {
  const { isRunning } = useDatabaseController();

  return <div>
    <p>Database Server: {String(isRunning)}</p>
  </div>
}
