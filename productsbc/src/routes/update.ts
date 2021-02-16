import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  requireAuthAdmin,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
} from '@lordpangan/common';
import { Product } from '../models/products';

const router = express.Router();

router.put(
  '/api/products/:id',
  requireAuth,
  requireAuthAdmin,
  [
    body('title').not().isEmpty().withMessage('Title is Required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
    body('quantity')
      .isInt({ gt: -1 })
      .withMessage('Quantity must be provided and must be greater than -1'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError();
    }

    product.set({
      title: req.body.title,
      price: req.body.price,
      quantity: req.body.quantity,
    });

    await product.save();

    res.send({ product });
  }
);

export { router as updateProductRouter };