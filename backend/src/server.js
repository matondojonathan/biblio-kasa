require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');

    console.log('PostgreSQL connecté');

    app.listen(PORT, () => {
      console.log(`Biblio-Kasa API : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur');
    console.error(error.message);

    process.exit(1);
  }
};

startServer();
