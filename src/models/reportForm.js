/**
 * Created by 0291 on 2017/8/24.
 */
export default {
  namespace: 'reportForm',
  state: {
    reportId: ''
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/reportform\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const reportId = match[1];
          dispatch({
            type: 'setState',
            payload: reportId
          });
        }
      });
    }
  },
  effects: {

  },
  reducers: {
    setState(state, { payload: reportId }) {
      return {
        ...state,
        reportId
      };
    }
  }
};
