import mongoose, { Connection } from 'mongoose';

interface MongoConnectionOptions {
  uri?: string;
  dbName?: string;
  reconnectDelay?: number; // ms between reconnect attempts
}

export class MongoConnection {
  private uri: string;
  private dbName: string;
  private reconnectDelay: number;
  private reconnecting = false;
  public connected: boolean = false;

  constructor(options: MongoConnectionOptions = {}) {
    this.uri = options.uri || 'mongodb://127.0.0.1:27017';
    this.dbName = options.dbName || 'test';
    this.reconnectDelay = options.reconnectDelay ?? 2000;

    // cleanup on app exit
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.cleanupAndExit(0));
    process.on('SIGTERM', () => this.cleanupAndExit(0));
  }

  public isConnected() {
    return this.connected;
  }

  /** Start connection (with auto-reconnect) */
  public async connect(): Promise<void> {
    mongoose.set('strictQuery', false);

    try {
      await mongoose.connect(this.uri, {
        dbName: this.dbName,
        serverSelectionTimeoutMS: 2000,
      });

      this.connected = true;
      console.log('✅ Connected to MongoDB:', this.uri);

      this.setupListeners();
    } catch (err) {
      this.connected = false;
      console.error('❌ Initial MongoDB connection failed:', err);
      this.scheduleReconnect();
    }
  }

  /** Setup mongoose event listeners */
  private setupListeners(): void {
    const conn: Connection = mongoose.connection;

    conn.on('connected', () => {
      this.connected = true;
      console.log('🔗 MongoDB connection established.');
    });

    conn.on('disconnected', () => {
      this.connected = false;
      console.warn('⚠️ MongoDB disconnected.');
      this.scheduleReconnect();
    });

    conn.on('error', (err) => {
      this.connected = false;
      console.error('❌ MongoDB error:', err);
      this.scheduleReconnect();
    });
  }

  /** Retry connection with delay */
  private scheduleReconnect(): void {
    if (this.reconnecting) return;
    this.reconnecting = true;

    setTimeout(async () => {
      this.reconnecting = false;
      console.log('🔄 Attempting MongoDB reconnect...');
      await this.connect();
    }, this.reconnectDelay);
  }

  /** Disconnect cleanly */
  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.connected = false;
      console.log('🛑 MongoDB connection closed.');
    }
  }

  private async cleanup(): Promise<void> {
    await this.disconnect();
  }

  private async cleanupAndExit(code: number): Promise<void> {
    await this.cleanup();
    process.exit(code);
  }
}
