import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

interface MongodOptions {
  dbPath?: string;
  port?: number;
  args?: string[];
  restartDelay?: number; // in ms
}

export class MongodController {
  private dbPath: string;
  private port: number;
  private args: string[];
  private restartDelay: number;
  private process: ChildProcessWithoutNullStreams | null = null;
  private running: boolean = false;
  private stopping: boolean = false;

  constructor(options: MongodOptions = {}) {
    this.dbPath = options.dbPath || 'C:\\data\\db';
    this.port = options.port || 27017;
    this.args = ['--dbpath', this.dbPath, '--port', String(this.port)];
    this.restartDelay = options.restartDelay || 2000;

    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.cleanupAndExit(0));
    process.on('SIGTERM', () => this.cleanupAndExit(0));
  }

  public isRunning() {
    return this.running;
  }

  public start(): void {
    if (this.process) {
      console.log('mongod is already running.');
      return;
    }

    console.log('Starting mongod...');
    this.running = true;
    this.spawnProcess();
  }

  private spawnProcess(): void {
    this.stopping = false;

    this.process = spawn('mongod', this.args, {
      shell: true, // required for PATH lookup on Windows
    });

    this.process.on('error', (err) => {
      console.error('mongod process error:', err);
      this.restart();
    });

    this.process.on('exit', (code, signal) => {
      this.process = null;
      if (this.stopping) {
        this.running = false;
        console.log('mongod stopped manually.');
      } else {
        console.error(
          `mongod exited with code ${code}, signal ${signal}. Restarting...`,
        );
        this.restart();
      }
    });
  }

  private restart(): void {
    if (this.stopping) return;
    setTimeout(() => {
      console.log('Restarting mongod...');
      this.spawnProcess();
    }, this.restartDelay);
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.process) {
        console.log('mongod is not running.');
        return resolve();
      }

      console.log('Stopping mongod...');      
      this.stopping = true;
      this.process.once('exit', () => resolve());

      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(this.process.pid), '/f', '/t'], {
          shell: true,
        });
      } else {
        this.process.kill('SIGTERM');
      }
    });
  }

  private async cleanup(): Promise<void> {
    if (this.process) {
      console.log('Cleaning up mongod before exit...');
      await this.stop();
    }
  }

  private async cleanupAndExit(code: number): Promise<void> {
    await this.cleanup();
    process.exit(code);
  }
}
