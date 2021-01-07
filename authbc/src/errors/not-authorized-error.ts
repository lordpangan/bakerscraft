import { CusterError } from './custom-errors';
export class NotAuthorizedError extends CusterError {
  statusCode = 401;

  constructor() {
    super('Not Authorized');

    // only because we are extending a built in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Authorized' }];
  }
}
