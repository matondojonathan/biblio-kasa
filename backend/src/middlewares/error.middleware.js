const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable`,
  });
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Une erreur interne est survenue',
  });
};

module.exports = {
  notFound,
  errorHandler,
};
