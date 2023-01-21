import joi from "joi";

export const registrationSchema = joi.object({
    name: joi.string().alphanum().min(3).max(10).required(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
    password: joi.string().alphanum().min(3).max(10).required(),
    repeatPassword: joi.any().valid(joi.ref('password')).required()
  });

export const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required()
})

export const movimentSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().min(3).required()
})