export class AppInfoModel {
  public localIpAddress: string;
  public localPort: number;
  public serverAddress: string;
  public meetingId: string;
  public databasePath: string;
  public databasePort: number;

  constructor (other?: AppInfoModel) {
    this.localIpAddress = other?.localIpAddress || '127.0.0.1';
    this.localPort = other?.localPort || 5005;
    this.serverAddress = other?.serverAddress || 'http://localhost:5000';
    this.meetingId = other?.meetingId || '';
    this.databasePath = other?.databasePath || '';
    this.databasePort = other?.databasePort || 27017;
  }
}
