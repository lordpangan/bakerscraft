export abstract class CusterError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super();

    // only because we are extending a built in class
    Object.setPrototypeOf(this, CusterError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
