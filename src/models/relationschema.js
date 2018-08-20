/**
 * Created by 0291 on 2017/7/10.
 */
import {
  queryContactrelation
} from '../services/customer';

export default {
  namespace: 'relationschema',
  state: {
    data: [],
    linkData: [],
    loading: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm\/([^/]+)\/([^/]+)\/relationschema/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const contactId = match[2];
          dispatch({ type: 'init', payload: { contactId : contactId } });
        }
      });
    }
  },
  effects: {
    *init({payload: { contactId } }, { select, put }) { //进入页面就查客户关系树的数据
      yield put({ type: 'queryContactrelation', payload: {
        contactId,
        Level: 2
      } });
    },
    *queryContactrelation({ payload: queries }, { put, select, call }) {
      yield put({ type: 'queryRequest', payload: queries });
      try {
        const { recordDetail: { recname } } = yield select(state => state.entcommHome);
        const { data } = yield call(queryContactrelation, queries);
        yield put({
          type: 'querySuccess',
          payload: {
            data: data.data,
            linkData: data.links.map(item => {
              return {
                source: item.contact1name,
                target: item.contact2name,
                name: ['前同事', '同事', '朋友', '亲人', '远房'][item.relationtype - 1],
                des: ''
              };
            })
          }
        });
      } catch (e) {
        yield put({ type: 'queryFailure', payload: e.message });
      }
    }
  },
  reducers: {
    queryRequest(state, { payload: queries }) {
      return { ...state, queries, loading: true };
    },
    querySuccess(state, { payload }) {
      return {
        ...state,
        data: payload.data,
        linkData: payload.linkData,
        loading: false
      };
    },
    queryFailure(state, { payload: errMsg }) {
      return { ...state, errMsg, loading: false };
    }
  }
};
