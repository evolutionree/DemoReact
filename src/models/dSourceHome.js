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
    colNames: []
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
        colNames
      } = yield select(state => state.dSourceHome);
      if (!sqlContent) return message.error('请输入数据源内容');
      if (!mobViewConfig.viewstyleid) return message.error('请选择数据源样式');
      if (!colNames.length) return message.error('请输入字段列名');
      try {
        const isUpdate = rawDetailData.dataconfid;
        const saveFn = isUpdate ? updateDetail : saveDetail;
        const params = {
          rulesql: sqlContent,
          viewstyleid: mobViewConfig.viewstyleid,
          colnames: colNames.filter(n => !!n).map(v => v && v.replace(/^\s+|\s+$/g, '')).join(','),
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
        fieldkeys,
        colors,
        fonts,
        viewstyleid
      } = detailData;
      const mobViewConfig = {
        colors: colors || '#666666,#666666,#666666,#666666,#666666,#666666',
        fonts: fonts || '14,14,14,14,14,14',
        viewstyleid
      };
      const colNames = (fieldkeys && fieldkeys.split(',')) || [];
      return {
        ...state,
        rawDetailData: detailData,
        dataSourceName,
        sqlContent,
        mobViewConfig,
        colNames
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
    },
    colNames(state, { payload: colNames }) {
      return {
        ...state,
        colNames
      };
    }
  }
};
