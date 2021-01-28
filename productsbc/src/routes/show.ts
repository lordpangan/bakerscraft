import express, { Request, Response } from 'express';
import { NotFoundError } from '@lordpangan/common';
import { Product } from '../models/products';

const router = express.Router();

router.get('/api/products/:id', async (req: Request, res: Response) => {
  const ticket = await Product.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showProductRouter };
