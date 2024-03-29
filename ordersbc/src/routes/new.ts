import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
  OrderStatus,
} from '@lordpangan/common';
import { Product, ProductDoc } from '../models/product';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('productsId')
      .not()
      .isEmpty()
      .isArray()
      .withMessage('ProductId must be provided'),
    body('paymentRef')
      .not()
      .isEmpty()
      .withMessage('Payment Referrence must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { productsId, paymentRef, paymentRes } = req.body;

    // Check the product the customer is trying to order in if In-Stock
    var products = [];
    var productsStr = [];

    for (var prodId in productsId) {
      var product = await Product.findById(productsId[prodId].productId);
      var productStr = productsId[prodId].productId;

      if (!product) {
        throw new NotFoundError();
      }

      if (product.quantity < productsId[prodId].quantity) {
        throw new BadRequestError('Out of Stock!');
      }

      products.push({
        productId: product,
        price: product.price,
        quantity: productsId[prodId].quantity,
      });

      productsStr.push({
        productId: productStr,
        price: product.price,
        quantity: productsId[prodId].quantity,
      });
    }

    // Calculate an expiration date for this Order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database - minus the product quantity
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      products: products,
      paymentRef,
      paymentRes,
    });
    await order.save();

    // Publish an event that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      version: order.version,
      orderId: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      products: productsStr,
      paymentRef,
      paymentRes,
    });

    res.status(201).send({ order });
  }
);

export { router as newOrderRouter };
