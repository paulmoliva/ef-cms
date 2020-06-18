const joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { FORMATS } = require('../business/utilities/DateHandler');
const { MAX_FILE_SIZE_BYTES } = require('../business/entities/EntityConstants');
// if repeatedly using the same rules to validate how an input should be formatted, capture it here.
exports.JoiValidationConstants = {
  // eslint-disable-next-line spellcheck/spell-checker
  // TODO: remove FORMATS.YYYYMMDD from valid timestamp formats after devex task
  ISO_DATE: joi.date().iso().format([FORMATS.ISO, FORMATS.YYYYMMDD]),
  MAX_FILE_SIZE_BYTES: joi.number().integer().min(1).max(MAX_FILE_SIZE_BYTES),
  TWENTYFOUR_HOUR_MINUTES: joi
    .string()
    .regex(/^(([0-1][0-9])|([2][0-3])):([0-5][0-9])$/),
  US_POSTAL_CODE: joi.string().regex(/^(\d{5}|\d{5}-\d{4})$/),
  UUID: joi.string().uuid({
    version: ['uuidv4'],
  }),
};
