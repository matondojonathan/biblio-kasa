const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const auteurRoutes = require('./routes/auteur.routes');
const membreRoutes = require('./routes/membre.routes');
const livreRoutes = require('./routes/livre.routes');
const empruntRoutes = require('./routes/emprunt.routes');
const statistiqueRoutes = require('./routes/statistique.routes');

const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Biblio-Kasa API is running',
  });
});



app.use('/api/auteurs', auteurRoutes);
app.use('/api/membres', membreRoutes);
app.use('/api/livres', livreRoutes);
app.use('/api/emprunts', empruntRoutes);
app.use('/api/statistiques', statistiqueRoutes);







app.use(notFound);
app.use(errorHandler);

module.exports = app;
