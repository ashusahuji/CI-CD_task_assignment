const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const DB_NAME = process.env.DB_NAME || 'dd_db';

module.exports = {
  url: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}`
};
