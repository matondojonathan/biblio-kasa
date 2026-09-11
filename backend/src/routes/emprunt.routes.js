const express = require('express');

const {
  getAllEmprunts,
  getEmpruntById,
  createEmprunt,
  updateEmprunt,
  returnEmprunt,
} = require('../controllers/emprunt.controller');

const validate = require('../middlewares/validation.middleware');

const {
  createEmpruntSchema,
  updateEmpruntSchema,
} = require('../validators/emprunt.validator');

const router = express.Router();

router.get('/', getAllEmprunts);
router.get('/:id', getEmpruntById);

router.post(
  '/',
  validate(createEmpruntSchema),
  createEmprunt
);

router.put(
  '/:id',
  validate(updateEmpruntSchema),
  updateEmprunt
);

router.patch('/:id/retour', returnEmprunt);

module.exports = router;