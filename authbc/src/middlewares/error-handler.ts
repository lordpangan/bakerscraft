import { Request, Response, NextFunction } from 'express';
import { CusterError } from '../errors/custom-errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CusterError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({
    error: [{ message: 'Something went wrong' }],
  });
};
