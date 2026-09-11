const express = require('express');

const {
  getAllMembres,
  getMembreById,
  createMembre,
  updateMembre,
  deleteMembre,
} = require('../controllers/membre.controller');

const validate = require('../middlewares/validation.middleware');

const {
  createMembreSchema,
  updateMembreSchema,
} = require('../validators/membre.validator');

const router = express.Router();

router.get('/', getAllMembres);
router.get('/:id', getMembreById);

router.post(
  '/',
  validate(createMembreSchema),
  createMembre
);

router.put(
  '/:id',
  validate(updateMembreSchema),
  updateMembre
);

router.delete('/:id', deleteMembre);

module.exports = router;