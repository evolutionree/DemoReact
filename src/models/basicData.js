import _ from 'lodash';
import { queryDepartmentData } from '../services/structure';
import { queryRegionData, queryDictionaries, queryProductTree, queryProductRaw } from '../services/basicdata';
import { queryRoles } from '../services/role';
import { getSeries } from "../services/products";

const PENDING = -1;
const EXPIRED_DURING = 3000; // 数据过期时间

function shouldRequestData(ts) {
  if (!ts) return true;
  const isPending = ts === PENDING;
  return !isPending && (new Date().getTime() - ts > EXPIRED_DURING);
}

export default {
  namespace: 'basicData',
  state: {
    departments: [],
    roles: [],
    regionData: [],
    dictionaryData: {},
    products: [],
    productSerial: [],
    dataTimestamp: {}
  },
  subscriptions: {

  },
  effects: {
    *fetchData({ payload: key }, { select, call, put }) {
      const { dataTimestamp } = yield select(state => state.basicData);

      if (shouldRequestData(dataTimestamp[key])) {
        yield put({
          type: 'putState',
          payload: {
            dataTimestamp: { ...dataTimestamp, [key]: PENDING }
          }
        });
        yield put({ type: 'fetch' + key.replace(/^\S/, s => s.toUpperCase()) });
      }
    },
    *fetchDepartments(action, { call, put }) {
      const { data } = yield call(queryDepartmentData, { status: 0 });
      yield put({
        type: 'receiveData',
        payload: {
          data,
          key: 'departments'
        }
      });
    },
    *fetchRoles(action, { call, put }) {
      const { data } = yield call(queryRoles, {
        groupId: '',
        pageIndex: 1,
        pageSize: 1000,
        roleName: ''
      });
      yield put({
        type: 'receiveData',
        payload: {
          data: data.page,
          key: 'roles'
        }
      });
    },
    *fetchRegionData(action, { call, put }) {
      const { data: { region } } = yield call(queryRegionData);
      const regionData = region.map(item => ({
        ...item,
        value: item.regionid,
        label: item.regionname
      }));
      yield put({
        type: 'receiveData',
        payload: {
          data: transformData(regionData),
          key: 'regionData'
        }
      });

      function transformData(data) {
        const tree = _.filter(data, item => item.nodepath === 0);
        loopChildren(tree);
        return tree;

        function loopChildren(nodes, parentNode) {
          nodes.forEach((node, index) => {
            node.path = parentNode ? [...parentNode.path, node.regionname] : [node.regionname];
            const id = node.regionid;
            const children = data.filter(item => item.ancestor === id);
            nodes[index].children = children.length ? children : null;
            loopChildren(children, node);
          });
        }
      }
    },
    *fetchDictionaryData(action, { call, put }) {
      const { data: { dicdata } } = yield call(queryDictionaries);
      yield put({
        type: 'receiveData',
        payload: {
          data: dicdata,
          key: 'dictionaryData'
        }
      });
    },
    *fetchProducts(action, { call, put }) {
      const { data } = yield call(queryProductTree);
      yield put({
        type: 'receiveData',
        payload: {
          data,
          key: 'products'
        }
      });
    },
    *fetchProductsRaw(action, { call, put }) {
      const { data } = yield call(queryProductRaw);
      yield put({
        type: 'receiveData',
        payload: {
          data,
          key: 'productsRaw'
        }
      });
    },
    *fetchProductSerial(action, { call, put }) {
      const { data } = yield call(getSeries, {
        ProductsetId: '',
        Direction: 'DOWNER',
        IsGetDisable: 0
      });
      yield put({
        type: 'receiveData',
        payload: {
          data,
          key: 'productSerial'
        }
      });
    }
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },
    receiveData(state, { payload: { data, key } }) {
      return {
        ...state,
        [key]: data,
        dataTimestamp: {
          ...state.dataTimestamp,
          [key]: new Date().getTime()
        }
      };
    }
  }
};
