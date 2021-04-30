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
  formatDate(str) {
    const date = new Date(str);
    return date.toLocaleString();
  },
  getEntityName(entity, type) {
    switch (type) {
      case 'performerId':
        return entity.getFullName();
      case 'statusId':
        return entity.name;
      case 'labels':
        return entity.name;
      default:
        throw new Error(`Unknown entity type: '${type}'`);
    }
  },
  isSameId({ id }, type, entity) {
    const { performerId, statusId, labels } = entity;

    switch (type) {
      case 'performerId':
        return id === Number(performerId);
      case 'statusId':
        return id === Number(statusId);
      case 'labels': {
        const labelId = labels
          ? [...labels].find((value) => id === Number(value))
          : undefined;

        return !_.isUndefined(labelId);
      }
      default:
        return false;
    }
  },
});
