import { Publisher, Subjects, ProductUpdatedEvent } from '@lordpangan/common';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
}
