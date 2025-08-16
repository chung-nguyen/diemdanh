/* eslint import/prefer-default-export: off */
import os from 'os';
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function getLocalIp() {
  const interfaces = os.networkInterfaces();
  if (interfaces) {
    for (const name of Object.keys(interfaces)) {
      if (!interfaces[name]) {
        continue;
      }
      for (const net of interfaces[name]) {
        // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
  }

  return "127.0.0.1"; // fallback
}
