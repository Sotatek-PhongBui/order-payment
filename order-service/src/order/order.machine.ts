import { OrderStatus } from 'src/entity/orderStatus.enum';
import { createMachine } from 'xstate';

export const orderStateMachine = createMachine({
  types: {} as {
    context: {
      status: OrderStatus;
      id: string;
    };
    events:
      | { type: 'confirmed' }
      | { type: 'cancelled' }
      | { type: 'deliveried' };
  },
  id: 'orderStatus',
  initial: OrderStatus.CREATED,
  context: {
    id: '1',
    status: OrderStatus.CREATED,
  },
  states: {
    [OrderStatus.CREATED]: {
      on: {
        confirmed: OrderStatus.CONFIRMED,
        cancelled: OrderStatus.CANCELLED,
      },
    },
    [OrderStatus.CONFIRMED]: {
      on: {
        deliveried: OrderStatus.DELIVERIED,
        cancelled: OrderStatus.CANCELLED,
      },
    },
    [OrderStatus.DELIVERIED]: {
      type: 'final',
    },
    [OrderStatus.CANCELLED]: {
      type: 'final',
    },
  },
});
