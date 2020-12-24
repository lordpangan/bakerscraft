import { CusterError } from './custom-errors';

export class NotFoundError extends CusterError {
  statusCode = 404;

  constructor() {
    super('Error connecting to database');

    // only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}
