import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  requireAuthAdmin,
  validateRequest,
} from '@lordpangan/common';
import { Product } from '../models/products';
import { ProductCreatedPublisher } from '../events/publishers/product-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/products',
  requireAuth,
  requireAuthAdmin,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater thank 0'),
    body('quantity')
      .isInt({ gt: -1 })
      .withMessage('Quantity must be greater thank 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price, quantity } = req.body;

    const product = Product.build({
      title,
      price,
      quantity,
      userId: req.currentUser!.id,
    });
    await product.save();
    await new ProductCreatedPublisher(natsWrapper.client).publish({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: product.quantity,
      userId: product.userId,
    });

    res.status(201).send(product);
  }
);

export { router as createProductRouter };
