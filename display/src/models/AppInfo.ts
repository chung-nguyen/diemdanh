export class AppInfoModel {
  public localIpAddress: string;
  public localPort: number;

  constructor (other?: AppInfoModel) {
    this.localIpAddress = other?.localIpAddress || '127.0.0.1';
    this.localPort = other?.localPort || 5005;
  }
}
