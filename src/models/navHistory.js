import _ from 'lodash';
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
    navStack: [],
    history: false, //记录当前是否是后退操作
    lastLocation: []
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        dispatch({
          type: 'pushLocation',
          payload: location
        });
        setTimeout(() => {
          dispatch({
            type: 'putState',
            payload: {
              history: false
            }
          });
        }, 300);
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
    },
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    pushLastLocation(state, { payload: lastLocation }) {
      return {
        ...state,
        lastLocation: [...state.lastLocation, lastLocation]
      };
    },
    removeLastLocation(state, { payload }) {
      let lastLocationArray = _.cloneDeep(state.lastLocation);
      const newLastLocation = lastLocationArray.filter((item, index) => {
        return index !== lastLocationArray.length - 1;
      });

      return {
        ...state,
        lastLocation: newLastLocation
      };
    }
  }
};
