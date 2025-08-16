import url from 'url';
import http from 'http';
import { BrowserWindow } from 'electron';

export class ProxyServer {
  private server: http.Server | null;
  private mainWindow: BrowserWindow | null;

  constructor() {
    this.server = null;
    this.mainWindow = null;
  }

  public run(port: number, mainWindow: BrowserWindow) {
    this.stop();

    this.mainWindow = mainWindow;
    const server = http.createServer((req, res) =>
      this.handleRequest(req, res),
    );
    server.listen(port, '0.0.0.0', () => {
      console.log('Server is running at http://localhost:3000');
    });

    this.server = server;
  }

  public stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (!this.mainWindow || !req.url) return;

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname?.startsWith('/qr')) {
      const parts = pathname.split('/');
      const code = parts[parts.length - 1];
      if (code) {
        this.mainWindow.webContents.send('qr-code', code);
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  }
}
