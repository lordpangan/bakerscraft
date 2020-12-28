import { CusterError } from './custom-errors';

export class BadRequestError extends CusterError {
  statusCode = 400;
  constructor(public errors: string) {
    super(errors);

    // only because we are extending a built in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.errors }];
  }
}
