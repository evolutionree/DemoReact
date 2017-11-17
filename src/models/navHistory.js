const STORE_KEY = 'uke_nav_history';

function getInitNavStack() {
  const str = sessionStorage.getItem(STORE_KEY);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function syncNavStack(navStack) {
  sessionStorage.setItem(STORE_KEY, JSON.stringify(navStack));
}

export default {
  namespace: 'navHistory',
  state: {
    navStack: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        dispatch({
          type: 'pushLocation',
          payload: location
        });
      });
    }
  },
  effects: {
    *navBack(action, { select, put }) {

    }
  },
  reducers: {
    pushLocation(state, { payload: location }) {
      const newNavStack = (location.action === 'REPLACE' || location.action === 'POP')
        ? [...state.navStack.slice(0, -1), location]
        : [...state.navStack, location];

      // syncNavStack(newNavStack);

      return {
        ...state,
        navStack: newNavStack
      };
    }
  }
};
