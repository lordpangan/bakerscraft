import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@lordpangan/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    var productsStr = [];

    const order = await Order.findById(req.params.orderId).populate({
      path: 'products',
      populate: [{ path: 'productId' }],
    });

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    for (var prodId in order.products) {
      productsStr.push({
        productId: order.products[prodId].productId._id,
        quantity: order.products[prodId].quantity,
      });
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event that an order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      orderId: order.id,
      products: productsStr,
      version: order.version,
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
