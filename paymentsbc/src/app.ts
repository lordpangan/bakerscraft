import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { updatePaymentsRouter } from './routes/update';
import { indexPaymentsRouter } from './routes/index';

import { NotFoundError, errorHandler, currentUser } from '@lordpangan/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(indexPaymentsRouter);
app.use(updatePaymentsRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
