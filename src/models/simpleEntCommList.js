export default{
    namespace:'simpleEntCommList',
    state:{

    },
    subscriptions:{
        entityId: undefined,
        custId: undefined
    },
    subscriptions: {
        setup({ dispatch, history }) {
          return history.listen(location => {
            const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/frameprotocol/;
            const match = location.pathname.match(pathReg);
            if (match) {
              const entityId = match[1];
              const custId = match[2];
              dispatch({ type: 'putState', payload: { entityId, custId } });
            } else {
              dispatch({ type: 'resetState' });
            }
          });
        }
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
            custId: undefined
          };
        }
      }
}