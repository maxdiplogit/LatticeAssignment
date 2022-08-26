// Packages
const Joi = require('joi');


const patientSchema = Joi.object({
    name: Joi.string().required(),
    gender: Joi.string().required(),
    address: Joi.string().min(10).required(),
    email: Joi.string().email().required(),
    number: Joi.string().min(10).max(13).required(),
    password: Joi.string().min(8).max(15).required(),
    psychiatrist_id: Joi.number().required()
});

module.exports = { patientSchema };