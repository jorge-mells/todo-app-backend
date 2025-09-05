import Joi from "joi"
import zxcvbn from "zxcvbn";
import { HttpError } from "./error-utils.js";

/**
 * @import { Schema, CustomHelpers } from 'joi'
 */

/**
 * Check the strength of the password.
 * @param {string} value - The string to validate.
 * @param {CustomHelpers} helpers - Joi helpers object.
 */
const passwordStrengthValidator = (value, helpers) => {
  const passwordResult = zxcvbn(value);
  
  if (passwordResult.score < 3) {
    const error = helpers.error('password.weak', {
      feedback: passwordResult.feedback.suggestions.join('. ')
    });
    return error;
  }
  
  return value;
};
export const authSchema = Joi.object({
  username: Joi.string().min(3).max(20).pattern(/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$/).required().messages({
    'string.pattern.base': 'Username must start and end with a letter or number, and can only contain letters, numbers, hyphens, or underscores.'
  }),
  password: Joi.string().required().custom(passwordStrengthValidator).messages({
    'password.weak': 'Your password is too weak. {{#feedback}}',
    'string.min': 'Password must be at least 8 characters long.',
    'string.max': 'Password cannot exceed 50 characters.'
  }),
});

export const tokenSchema = Joi.string().min(32).max(500).trim().required().messages({
  'string.min': 'Token must be at least 32 characters long.',
  'string.max': 'Token cannot exceed 500 characters.',
  'string.empty': 'Token cannot be empty.',
  'any.required': 'Token is required.',
})

const statusValues = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusSchema = Joi.string()
  .uppercase()
  .trim()
  .insensitive()
  .valid(...statusValues);
const tagSchema = Joi.string().max(255).trim();
export const todoSchema = Joi.object({
  title: Joi.string().required().min(1).max(255).trim(),
  content: Joi.string().required().min(1).max(500).trim(),
  status: statusSchema.default('PENDING'),
  tags : Joi.array().items(tagSchema).default([]),
  dueDate: Joi.date().min('now').optional()
})

/**
 * Convert a value to an array
 * @param {string | undefined | Array<string>} value - The string to validate.
 */
const toArray = (value) => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return [value];
  }
  return value;
};
export const filterParamsSchema = Joi.object({
  title: Joi.string().min(1).max(255).trim().optional(),
  content: Joi.string().optional().min(1).max(500).trim(),
  range: Joi.object({
    before: Joi.date().optional(),
    after: Joi.date().optional(),
  }).optional(),
  status: Joi.alternatives()
  .try(
    Joi.array().items(
      Joi.string().uppercase().trim().insensitive().valid(...statusValues)
    ).unique(),
    Joi.string().uppercase().trim().insensitive().valid(...statusValues)
  )
  .custom(toArray, 'convert to array')
  .default([]),
  tag: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().max(255).trim()).unique(),
      Joi.string().max(255).trim()
    )
    .custom(toArray, 'convert to array if needed')
    .default([]),
});
function makeUnique(arr) {
  if (arr instanceof Array) {
    return [ ...new Set(arr)];
  } else return arr;
}

/**
 * Validates an input object against a given Joi schema.
 * @param {Schema} schema - The Joi schema to validate against.
 * @param {object} input - The object to be validated.
 * @returns {any} The validated value from the schema.
 * @throws {HttpError} If the validation fails.
 */

export const validate = (schema, input) => {
  const options = {
    errors: {
      wrap: {
        label: false,
      }
    }
  };
  const result = schema.validate(input, options);
  // custom transformation, because I can't figure out joi
  if (result?.value?.status) result.value.status = makeUnique(result.value.status);
  if (result?.value?.tags) result.value.tags = makeUnique(result.value.tags);
  if (result.error) {
    throw new HttpError(result.error.message, 400);
  }
  return result.value;
}
