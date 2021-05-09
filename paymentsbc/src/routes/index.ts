import express, { Request, Response } from 'express';
import { requireAuth, requireAuthAdmin } from '@lordpangan/common';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/payments',
  requireAuthAdmin,
  async (req: Request, res: Response) => {
    const orders = await Order.find({});

    res.send(orders);
  }
);

export { router as indexPaymentsRouter };
