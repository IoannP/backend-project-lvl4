// @ts-nocheck

import path from 'path';
import fastify from 'fastify';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifySession from 'fastify-secure-session';
import fastifyPassport from 'fastify-passport';
import fastifyMethodOverride from 'fastify-method-override';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifyFormbody from 'fastify-formbody';
import fastifyStatic from 'fastify-static';
import pointOfView from 'point-of-view';
import Pug from 'pug';
import Youch from 'youch';
import i18next from 'i18next';
import Rollbar from 'rollbar';
import qs from 'qs';
import _ from 'lodash';
import ru from './locales/ru.js';

// @ts-ignore
import webpackConfig from '../webpack.config.babel.js';

import addRoutes from './routes/index.js';
import getHelpers from './helpers/index.js';
import knexConfig from '../knexfile';
import entitiesModels from './models';
import FormStrategy from './lib/passpot_strategies/form_strategy.js';

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
    const creator = await models.user.query().findById(task.creatorId);
    const executor = await models.user.query().findById(task.executorId);
    const status = await models.status.query().findById(task.statusId);
    const labels = await task.$relatedQuery('labels');

    return {
      id: task.id,
      name: task.name,
      creator: creator.getFullName(),
      executor: executor ? executor.getFullName() : '',
      status: status.name,
      labels: labels.map((label) => label.name),
      description: task.description,
      createdAt: task.createdAt,
    };
  });
};

const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });

  app.addHook('preHandler', async (req) => {
    const { body } = req;
    if (body) {
      body.data = _.omitBy(body.data, (value) => _.isEqual(value, ''));
    }
  });
};

const setErrorHandler = (app) => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.setErrorHandler((err, req, reply) => {
    rollbar.error(err, req, reply);
    try {
      const youch = new Youch(err, req.raw);
      youch.toHTML().then((html) => {
        reply.type('text/html');
        reply.send(html);
      });
    } catch (error) {
      reply.send(error);
    }
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
  setErrorHandler(app);

  return app;
};
