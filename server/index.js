// @ts-check

import path from 'path';
import fastify from 'fastify';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifySession from 'fastify-secure-session';
import fastifyPassport from 'fastify-passport';
import fastifyErrorPage from 'fastify-error-page';
import fastifyMethodOverride from 'fastify-method-override';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifyFormbody from 'fastify-formbody';
import fastifyStatic from 'fastify-static';
import pointOfView from 'point-of-view';
import Pug from 'pug';
import i18next from 'i18next';
import qs from 'qs';
import _, { values } from 'lodash';
import ru from './locales/ru.js';

// @ts-ignore
import webpackConfig from '../webpack.config.babel.js';

import addRoutes from './routes/index.js';
import getHelpers from './helpers/index.js';
import knexConfig from '../knexfile';
import entitiesModels from './models';
import FormStrategy from './lib/passpot_strategies/form_strategy.js';
import { date } from 'faker';

const mode = process.env.NODE_ENV || 'development';
const isProduction = mode === 'production';
const isDevelopment = mode === 'development';
require('dotenv').config();

const setupViews = (app) => {
  const { devServer } = webpackConfig;
  const devHost = `http://${devServer.host}:${devServer.port}`;
  const domain = isDevelopment ? devHost : '';
  const helpers = getHelpers(app);
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `${domain}/assets/${filename}`,
    },
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setupLocalization = () => {
  i18next
    .init({
      lng: 'ru',
      fallbackLng: 'en',
      debug: isDevelopment,
      resources: {
        ru,
      },
    });
};

const addPlugins = (app) => {
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models: entitiesModels,
  });
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifyReverseRoutes);
  app.register(fastifyErrorPage);
  app.register(fastifySession, {
    secret: process.env.SESSION_KEY,
    cookie: {
      path: '/',
    },
  });
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());
  fastifyPassport.registerUserSerializer((user) => Promise.resolve(user));
  fastifyPassport.registerUserDeserializer(
    (user) => app.objection.models.user.query().findById(user.id),
  );
  fastifyPassport.use(new FormStrategy('form', app));
  app.register(fastifyMethodOverride);
  app.decorate('fp', fastifyPassport);
  app.decorate('authenticate', (...args) => fastifyPassport.authenticate(
    'form',
    {
      failureRedirect: app.reverse('root'),
      failureFlash: i18next.t('flash.authError'),
    },
  // @ts-ignore
  )(...args));

  app.decorate('container', new Map());

  app.decorateRequest('errors', (data = []) => {
    app.container.set('errors', data);
  });

  app.decorateRequest('entity', (type, data = []) => {
    app.container.set(type, data);
  });

  app.decorateReply('errors', () => {
    const data = app.container.has('errors')
      ? app.container.get('errors')
      : [];
    app.container.set('errors', []);
    return data;
  });

  app.decorateReply('entity', (type) => {
    const data = app.container.has(type)
      ? app.container.get(type)
      : [];
    app.container.delete(type);
    return data;
  });

  app.decorateRequest('getTaskData', async (task) => {
    const { models } = app.objection;
    const author = await models.user.query().findById(task.authorId);
    const performer = await models.user.query().findById(task.performerId);
    const status = await models.status.query().findById(task.statusId);
    const labels = await task.$relatedQuery('labels');

    return {
      id: task.id,
      name: task.name,
      author: author.getFullName(),
      performer: performer ? performer.getFullName() : '',
      status: status.name,
      labels: labels.map((label) => label.name),
      description: task.description,
      createdAt: task.createdAt,
    };
  });

  app.decorateRequest('parse', async (bodydata) => {
    const data = _.omitBy(bodydata, (value) => _.isEqual(value, ''));
    if (_.has(data, 'statusId')) _.update(data, 'statusId', _.toNumber);
    if (_.has(data, 'performerId')) _.update(data, 'performerId', _.toNumber);
    return data;
  });
};

const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};

const setupStaticAssets = (app) => {
  const pathPublic = isProduction
    ? path.join(__dirname, '..', 'public')
    : path.join(__dirname, '..', 'dist', 'public');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

export default () => {
  const app = fastify({
    logger: {
      prettyPrint: isDevelopment,
    },
  });

  setupLocalization();
  setupStaticAssets(app);
  setupViews(app);
  addPlugins(app);
  addRoutes(app);
  addHooks(app);

  return app;
};
