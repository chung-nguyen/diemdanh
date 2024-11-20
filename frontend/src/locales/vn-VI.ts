import component from './vn-VI/component';
import globalHeader from './vn-VI/globalHeader';
import menu from './vn-VI/menu';
import pages from './vn-VI/pages';
import pwa from './vn-VI/pwa';
import settingDrawer from './vn-VI/settingDrawer';
import settings from './vn-VI/settings';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};
