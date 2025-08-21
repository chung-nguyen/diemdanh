import { useDatabaseController } from '../provider/DatabaseController';

export const DatabaseStatusPanel = () => {
  const { isRunning, isConnected } = useDatabaseController();

  return (
    <div>
      <p>Database Server: {String(isRunning)}</p>
      <p>Database Connected: {String(isConnected)}</p>
    </div>
  );
};
