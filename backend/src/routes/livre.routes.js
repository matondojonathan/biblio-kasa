const express = require('express');

const {
  getAllLivres,
  getLivreById,
  createLivre,
  updateLivre,
  deleteLivre,
} = require('../controllers/livre.controller');

const validate = require('../middlewares/validation.middleware');

const {
  createLivreSchema,
  updateLivreSchema,
} = require('../validators/livre.validator');

const router = express.Router();

router.get('/', getAllLivres);
router.get('/:id', getLivreById);

router.post(
  '/',
  validate(createLivreSchema),
  createLivre
);

router.put(
  '/:id',
  validate(updateLivreSchema),
  updateLivre
);

router.delete('/:id', deleteLivre);

module.exports = router;