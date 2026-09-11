const express = require('express');

const {
  getAllAuteurs,
  getAuteurById,
  createAuteur,
  updateAuteur,
  deleteAuteur,
} = require('../controllers/auteur.controller');

const validate = require('../middlewares/validation.middleware');

const {
  createAuteurSchema,
  updateAuteurSchema,
} = require('../validators/auteur.validator');

const router = express.Router();

router.get('/', getAllAuteurs);
router.get('/:id', getAuteurById);

router.post(
  '/',
  validate(createAuteurSchema),
  createAuteur
);

router.put(
  '/:id',
  validate(updateAuteurSchema),
  updateAuteur
);

router.delete('/:id', deleteAuteur);

module.exports = router;