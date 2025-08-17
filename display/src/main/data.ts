import os from 'os';
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

export class DataProvider {
  public appInfo: AppInfoModel;

  constructor() {
    this.appInfo = new AppInfoModel();
  }

  public async load() {
    const settingsPath = await this.findSettingsFilePath();
    if (settingsPath) {
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
    const defaultPath = await this.prepareDefaultSettingFilePath();
    const settingsPath = await this.findSettingsFilePath();
    const content = JSON.stringify(this.appInfo);
    if (settingsPath) {
      await fs.promises.writeFile(settingsPath, content);
    }
    if (settingsPath !== defaultPath) {
      await fs.promises.writeFile(defaultPath, content);
    }
  }

  private async findSettingsFilePath() {
    const fileName = 'settings.json';
    let settingsPath = path.join(process.cwd(), fileName);
    let exists = await fileExists(settingsPath);
    if (exists) {
      return settingsPath;
    }

    settingsPath = path.join(os.homedir(), 'smartcivic', fileName);
    exists = await fileExists(settingsPath);
    if (exists) {
      return settingsPath;
    }

    return null;
  }

  private async prepareDefaultSettingFilePath() {
    const fileName = 'settings.json';
    const settingDirectory = path.join(os.homedir(), 'smartcivic');
    const settingsPath = path.join(settingDirectory, fileName);
    try {
      await fs.promises.mkdir(settingDirectory, { recursive: true });
    } catch (ex) {
      console.error(ex);
    }
    return settingsPath;
  }
}
