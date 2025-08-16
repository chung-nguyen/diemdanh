import { AppInfoModel } from '../models/AppInfo';

class DataProviderClass {
  public appInfo: AppInfoModel;

  constructor () {
    this.appInfo = new AppInfoModel();
  }

  public load () {

  }

  public save() {
    
  }
}

export const DataProvider = new DataProviderClass();
