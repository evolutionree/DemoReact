import { message } from 'antd';
import { queryDetail, saveDetail, updateDetail } from '../services/datasource';

export default {
  namespace: 'dSourceHome',
  state: {
    dataSourceId: null,
    rawDetailData: null,
    dataSourceName: '',
    sqlContent: '',
    mobViewConfig: {},
    columnsDataSource: [],
    showModals: '',
    editData: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/dsource\/([^/]+)/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const dataSourceId = match[1];
          dispatch({ type: 'dataSourceId', payload: dataSourceId });
          dispatch({ type: 'queryDetail' });
        }
      });
    }
  },
  effects: {
    *queryDetail(action, { select, call, put }) {
      try {
        const { dataSourceId } = yield select(state => state.dSourceHome);
        const result = yield call(queryDetail, dataSourceId);
        const detailData = result.data.datasourcedetail[0];
        yield put({ type: 'queryDetailSuccess', payload: detailData });
      } catch (e) {
        console.error(e);
        message.error(e.message || '获取数据失败');
      }
    },
    *save(action, { select, call, put }) {
      const {
        rawDetailData,
        dataSourceId,
        sqlContent,
        mobViewConfig,
        columnsDataSource: columns
      } = yield select(state => state.dSourceHome);
      if (!sqlContent) return message.error('请输入数据源内容');
      if (!mobViewConfig.viewstyleid) return message.error('请选择数据源样式');
      try {
        const isUpdate = rawDetailData.dataconfid;
        const saveFn = isUpdate ? updateDetail : saveDetail;
        const params = {
          rulesql: sqlContent,
          viewstyleid: mobViewConfig.viewstyleid,
          columns: JSON.stringify(columns),
          fonts: mobViewConfig.fonts,
          colors: mobViewConfig.colors
        };
        if (isUpdate) {
          params.DataConfigId = rawDetailData.dataconfid;
        } else {
          params.datasourceid = dataSourceId;
        }
        yield call(saveFn, params);
        message.success('保存成功');
        yield put({ type: 'queryDetail' });
      } catch (e) {
        console.error(e);
        message.error(e.message || '保存失败');
      }
    }
  },
  reducers: {
    putState(state, { payload: assignment }) {
      return {
        ...state,
        ...assignment
      };
    },
    showModals(state, { payload: type }) {
      return {
        ...state,
        showModals: type
      };
    },
    updateColumnsDataSource(state, { payload: newColumnsDataSource }) {
      return {
        ...state,
        columnsDataSource: newColumnsDataSource.map((item, index) => {
          item.recorder = index + 1;
          return item;
        })
      };
    },
    dataSourceId(state, { payload: dataSourceId }) {
      return {
        ...state,
        dataSourceId
      };
    },
    queryDetailSuccess(state, { payload: detailData }) {
      const {
        datasrcname: dataSourceName,
        rulesql: sqlContent,
        colors,
        fonts,
        viewstyleid,
        columns
      } = detailData;
      const mobViewConfig = {
        colors: colors || '#666666,#666666,#666666,#666666,#666666,#666666',
        fonts: fonts || '14,14,14,14,14,14',
        viewstyleid
      };
      return {
        ...state,
        rawDetailData: detailData,
        dataSourceName,
        sqlContent,
        mobViewConfig,
        columnsDataSource: JSON.parse(columns) || []
      };
    },
    sqlContent(state, { payload: sqlContent }) {
      return {
        ...state,
        sqlContent
      };
    },
    mobViewConfig(state, { payload: mobViewConfig }) {
      return {
        ...state,
        mobViewConfig
      };
    }
  }
};
