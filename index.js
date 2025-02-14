const config = require('./src/utils/config');
const logger = require('./src/utils/logger');
const app = require('./src/app');

app.listen(config.PORT, () => {
  logger.info(`Server starting on port ${config.PORT}`);
});
