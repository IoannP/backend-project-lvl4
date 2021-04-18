import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';
import statuses from './statuses.js';
import tasks from './tasks.js';
import label from './label.js';

const controllers = [
  welcome,
  users,
  session,
  statuses,
  tasks,
  label,
];

export default (app) => controllers.forEach((f) => f(app));
