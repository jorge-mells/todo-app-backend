import app from './src/app.js'
import logger from "./src/utils/logger.js"
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
