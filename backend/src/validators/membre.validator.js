const Joi = require('joi');

const createMembreSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(100).required(),
  prenom: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().max(255).allow('', null),
  telephone: Joi.string().trim().max(30).allow('', null),
  actif: Joi.boolean().default(true),
});

const updateMembreSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(100).required(),
  prenom: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().max(255).allow('', null),
  telephone: Joi.string().trim().max(30).allow('', null),
  actif: Joi.boolean().required(),
});

module.exports = {
  createMembreSchema,
  updateMembreSchema,
};