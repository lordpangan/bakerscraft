import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@lordpangan/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
