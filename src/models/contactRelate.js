export default {
  namespace: 'contactRelate',
  state: {
    entityId: undefined,
    recordId: undefined
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/contactRelate/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const recordId = match[2];
          dispatch({ type: 'putState', payload: { entityId, recordId } });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
   
  },
  reducers: {
    putState(state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      };
    },
    resetState() {
      return {
        entityId: undefined,
        recordId: undefined
      };
    }
  }
};
