import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@lordpangan/common';
import { Product } from '../models/products';

const router = express.Router();

router.post(
  '/api/products',
  requireAuth,
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

    res.status(201).send(product);
  }
);

export { router as createProductRouter };
