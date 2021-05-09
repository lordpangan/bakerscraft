import { Subjects, Publisher, PaymentVerifiedEvent } from '@lordpangan/common';

export class PaymentVerifiedPublisher extends Publisher<PaymentVerifiedEvent> {
  subject: Subjects.PaymentVerified = Subjects.PaymentVerified;
}
