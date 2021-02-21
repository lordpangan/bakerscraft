import { Publisher, Subjects, ProductCreatedEvent } from '@lordpangan/common';

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
  subject: Subjects.ProductCreated = Subjects.ProductCreated;
}
