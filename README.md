# NeoTree :: App designed for managing neonatal patients in low resource settings, providing a digital admission form for real time data collection and a platform for neonatal training.

![React, Redux, Router, Webpack, Sass](https://eu-west-1.console.aws.amazon.com/codesuite/codecommit/repositories/neotree-editor/browse/refs/heads/web/--/.git-assets/React-Redux-Router-Webpack-Sass.png)

Perceived performance and development experience are key factors in this setup.

## Configuration

  `$ npm install`

  ### Development

  Add: `_config/config.development.json`

  ```json
    {
      "port": "PORT (e.g. 3000)",
      "host": "HOSTNAME (e.g. http://localhost:3000)",
      "database": {
        "user": "db user",
        "database": "db name",
        "password": "db user password",
        "port": "port (optional, default 5432)",
        "max": "(optional)",
        "idleTimeoutMillis": "(optional)"
      }
    }
  ```

  `$ npm start`

  ### Production

  Add `_config/config.production.json`

  ```json
    {
      "port": "PORT (e.g. 80)",
      "host": "HOSTNAME (e.g. https://yoursite.com)",
      "database": {
        "user": "db user",
        "database": "db name",
        "password": "db user password",
        "port": "port (optional, default 5432)",
        "max": "(optional)",
        "idleTimeoutMillis": "(optional)"
      }
    }
  ```

  First build the production bundle:
    ```
    npm run build
    ```

  Then run the production bundle:
    ```
    npm run dist
    ```
