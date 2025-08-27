import 'dotenv/config'
import app from './src/app.js'
import logger from "./src/utils/logger.js"

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
