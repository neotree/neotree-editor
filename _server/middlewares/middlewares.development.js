import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../../webpack.development.config';

module.exports = app => {
  // webpack
  const compiler = webpack(webpackConfig);
  const wdm = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  });
  app.wdm = wdm;
  app.use(wdm);
  app.use(webpackHotMiddleware(compiler));

  return app;
};
