const Joi = require('joi');

const livreSchema = Joi.object({
  titre: Joi.string().trim().min(2).max(255).required(),

  auteur_id: Joi.number().integer().positive().required(),

  annee_publication: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .allow(null),

  isbn: Joi.string().trim().max(20).allow('', null),

  statut: Joi.string()
    .valid('disponible', 'emprunte')
    .default('disponible'),
});

module.exports = {
  createLivreSchema: livreSchema,
  updateLivreSchema: livreSchema,
};