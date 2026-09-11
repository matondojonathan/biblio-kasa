const express = require('express');

const {
  getStatistiques,
} = require('../controllers/statistique.controller');

const router = express.Router();

router.get('/', getStatistiques);

module.exports = router;