import welcome from './welcome.js';
import users from './users.js';

const controllers = [welcome, users];

export default (app) => controllers.forEach((f) => f(app));
