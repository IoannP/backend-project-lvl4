import i18next from 'i18next';
import _ from 'lodash';

export default (app) => ({
  t(key) {
    return i18next.t(key);
  },
  _,
  route(name) {
    return app.reverse(name);
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
    const [match] = type.match(/status|executor|label/ig);
    switch (match) {
      case 'executor':
        return entity.getFullName();
      case 'status':
        return entity.name;
      case 'label':
        return entity.name;
      default:
        throw new Error(`Unknown entity type: '${type}'`);
    }
  },
  isSameId({ id }, type, entity) {
    const {
      executorId,
      executor,
      statusId,
      status,
      labels,
      label,
    } = entity;
    const [match] = type.match(/status|executor|label/ig);

    switch (match) {
      case 'executor':
        return id === Number(executorId) || id === Number(executor);
      case 'status':
        return id === Number(statusId) || id === Number(status);
      case 'label': {
        const labelId = labels || label
          ? [labels, label].flat().find((value) => id === Number(value))
          : undefined;

        return !_.isUndefined(labelId);
      }
      default:
        return false;
    }
  },
});
