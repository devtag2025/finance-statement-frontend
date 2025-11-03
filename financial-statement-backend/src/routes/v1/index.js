const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const uploadRoute = require('./upload.route');
const parseRoute = require('./parse.route');
const calcRoute = require('./calc.route');
const exportRoute = require('./export.route');
const billingRoute = require('./billing.routes');
const router = express.Router();
const planRoute = require('./plan.routes');
const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
  },
  {
    path: '/parse',
    route: parseRoute,
  },
  {
    path: '/calc',
    route: calcRoute,
  },
  {
    path: '/export',
    route: exportRoute,
  },
  {
    path: '/billing',
    route: billingRoute,
  },
  {
    path: '/plans',
    route: planRoute,
  }

];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
