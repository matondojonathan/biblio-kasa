const Joi = require('joi');

const createAuteurSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Le nom est obligatoire',
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères',
    'any.required': 'Le nom est obligatoire',
  }),

  prenom: Joi.string().trim().max(100).allow('', null).messages({
    'string.max': 'Le prénom ne peut pas dépasser 100 caractères',
  }),
});

const updateAuteurSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Le nom est obligatoire',
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères',
    'any.required': 'Le nom est obligatoire',
  }),

  prenom: Joi.string().trim().max(100).allow('', null).messages({
    'string.max': 'Le prénom ne peut pas dépasser 100 caractères',
  }),
});

module.exports = {
  createAuteurSchema,
  updateAuteurSchema,
};