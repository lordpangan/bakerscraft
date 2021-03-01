import { Publisher, OrderCreatedEvent, Subjects } from '@lordpangan/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
