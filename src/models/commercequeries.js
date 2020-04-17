import { } from '../services/structure';

const COMMERCEQUERIES = 'commercequeries';

export default {
  namespace: COMMERCEQUERIES,
  state: {

  },
  subscriptions: {

  },
  effects: {
    *Init(_, { put, call, select }) {

    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
};
