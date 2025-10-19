const app = require('./src/app');
const { PORT } = require('./src/config/environment');
const db = require('./src/config/database');

async function start() {
  // Intentar conectar a la DB, pero permitir que la app arranque aunque la conexión falle
  await db.connect();

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
    console.log(`DB connected: ${db.isConnected()}`);
  });
}

if (require.main === module) start();

module.exports = app;
