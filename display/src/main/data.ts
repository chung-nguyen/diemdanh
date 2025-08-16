import fs from 'fs';
import path from 'path';
import { AppInfoModel } from '../models/AppInfo';

async function fileExists(fp: string) {
  try {
    await fs.promises.access(fp);
    return true;
  } catch {
    console.log('File not found!');
  }
  return false;
}

class DataProviderClass {
  public appInfo: AppInfoModel;

  constructor() {
    this.appInfo = new AppInfoModel();
  }

  public async load() {
    const settingsPath = 'settings.json';
    const exists = await fileExists(settingsPath);
    if (exists) {
      const text = await fs.promises.readFile(settingsPath, 'utf-8');
      try {
        const data = JSON.parse(text);
        this.appInfo = new AppInfoModel(data);
      } catch (ex) {
        console.error(ex);
      }
    }
  }

  public async save() {
    const settingsPath = 'settings.json';
    await fs.promises.writeFile(settingsPath, JSON.stringify(this.appInfo));
  }
}

export const DataProvider = new DataProviderClass();
