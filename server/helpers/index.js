// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => ({
  t(key) {
    return i18next.t(key);
  },
  _,
  route(name, p) {
    return app.reverse(name, p);
  },
  getAlertClass(type) {
    switch (type) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown flash type: '${type}'`);
    }
  },
});
