import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  requireAuthAdmin,
  validateRequest,
  NotFoundError,
  BadRequestError,
  OrderStatus,
} from '@lordpangan/common';
import { Order } from '../models/order';
import { PaymentVerifiedPublisher } from '../events/publishers/payment-verified-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/payments/:id',
  requireAuth,
  requireAuthAdmin,
  [body('approve').not().isEmpty().withMessage('Approval must be provided')],
  async (req: Request, res: Response) => {
    const { approve } = req.body;

    if (approve != OrderStatus.Complete && approve != OrderStatus.Cancelled) {
      throw new BadRequestError(
        "Invalid Decision should be 'completed' or 'cancelled' only."
      );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a Cancelled Order');
    }

    order.set({
      status: approve,
    });

    await order.save();

    await new PaymentVerifiedPublisher(natsWrapper.client).publish({
      orderId: order.id,
      status: order.status,
    });

    res.send({ order });
  }
);

export { router as updatePaymentsRouter };
