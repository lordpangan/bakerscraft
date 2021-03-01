import { Publisher, OrderCancelledEvent, Subjects } from '@lordpangan/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
