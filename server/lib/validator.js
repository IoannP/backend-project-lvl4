import { ModelValidation } from 'objection';
import * as yup from 'yup';

export default class Validator {
  constructor() {
    this.init = () => {};
  }

  validate({ json, model }) {
    const modelClass = model.constructor;
    const validator = yup.object().shape(modelClass.jsonSchema);

    try {
      const validationResult = validator.validateSync(json, { abortEarly: false });
      return validationResult;
    } catch ({ inner }) {
      const error = this.parseValidationError(inner, modelClass);
      throw error;
    }
  }

  beforeValidate({ model, json, options }) {
    this.init();
    model.$beforeValidate(null, json, options);
  }

  afterValidate({ model, json, options }) {
    this.init();
    model.$afterValidate(json, options);
  }

  parseValidationError(errors, modelClass) {
    this.init();
    if (!errors) {
      return null;
    }

    const parsedErrors = errors.reduce((acc, error) => {
      const errorName = error.path;
      const newAcc = acc;
      const value = newAcc[errorName] || (newAcc[errorName] = []);

      value.unshift({
        message: error.errors[0],
        keyword: error.type,
        params: error.params,
      });

      return newAcc;
    }, {});

    return modelClass.createValidationError({
      type: ModelValidation,
      data: parsedErrors,
    });
  }
}
