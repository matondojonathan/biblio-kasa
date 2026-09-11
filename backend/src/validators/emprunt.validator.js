const Joi = require('joi');

const createEmpruntSchema = Joi.object({
  membre_id: Joi.number().integer().positive().required(),

  livre_id: Joi.number().integer().positive().required(),

  date_retour_prevue: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'La date de retour prévue doit être une date valide',
      'any.required': 'La date de retour prévue est obligatoire',
    }),
});

const updateEmpruntSchema = Joi.object({
  date_retour_prevue: Joi.date()
    .iso()
    .required(),
});

module.exports = {
  createEmpruntSchema,
  updateEmpruntSchema,
};