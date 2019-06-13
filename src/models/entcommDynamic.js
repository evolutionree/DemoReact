/**
 * Created by 0291 on 2018/1/12.
 */
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import {
  getDynamicListProtocol,
  getListData,
  likeEntcommActivity,
  commentEntcommActivity,
  getActivityDetail
} from '../services/entcomm'
import {
  queryEntityDetail,
  queryTypes,
  queryListFilter,
  getDynamicDetail
} from '../services/entity'

export default {
  namespace: 'entcommDynamic',
  state: {
    entityId: '',
    entityName: '',
    entityTypes: [],
    protocol: [],
    queries: {},
    list: [],
    total: 0,
    showModals: '',
    modalPending: false,
    simpleSearchKey: 'recname',
    searchTips: '',
    sortFieldAndOrder: null, // 当前排序的字段及排序顺序
    ColumnFilter: null, // 字段查询
    detailData: {},
    showDetailModals: ''
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entcomm-dynamic\/([^/]+)$/
        const match = location.pathname.match(pathReg)
        if (match) {
          const entityId = match[1]
          dispatch({ type: 'init', payload: entityId })
        } else {
          dispatch({ type: 'resetState' })
        }
      })
    }
  },
  effects: {
    * init ({ payload: entityId }, { select, call, put, take }) {
      const lastEntityId = yield select(state => state.entcommDynamic.entityId)
      if (lastEntityId === entityId) {
        yield put({ type: 'queryList' })
        return
      }
      yield put({ type: 'resetState' })
      yield put({ type: 'entityId', payload: entityId })
      sessionStorage.setItem('seachQuery', '')
      try {
        // 获取实体信息
        const { data } = yield call(queryEntityDetail, entityId)
        yield put({
          type: 'entityName',
          payload: data.entityproinfo[0].entityname
        })

        // 获取实体类型
        const {
          data: { entitytypepros: entityTypes }
        } = yield call(queryTypes, { entityId })
        yield put({ type: 'entityTypes', payload: entityTypes })

        // 获取协议
        const { data: protocol } = yield call(getDynamicListProtocol, {
          typeId: entityId
        })
        yield put({ type: 'protocol', payload: protocol })

        // 获取简单搜索
        const {
          data: { simple, fields }
        } = yield call(queryListFilter, entityId)
        let simpleSearchKey = 'recname'
        let searchTips = ''
        let simpleSearchId = ''
        if (simple && simple.length) {
          simpleSearchKey = simple[0].fieldname
          simpleSearchId = simple[0].fieldid
        }
        if (fields && fields.length) {
          const searchList = fields.filter(
            item => item.fieldid === simpleSearchId
          )
          searchTips = searchList.length === 1 && searchList[0].displayname
        }
        yield put({
          type: 'putState',
          payload: { simpleSearchKey, searchTips }
        })

        yield put({ type: 'queryList' })
      } catch (e) {
        message.error(e.message || '获取协议失败')
      }
    },
    * search ({ payload }, { select, call, put }) {
      const location = yield select(
        ({ routing }) => routing.locationBeforeTransitions
      )
      const { pathname, query } = location
      let newMergeParams = { ...payload }
      if (payload.hasOwnProperty('ColumnFilter')) {
        const ColumnFilter = JSON.stringify(payload.ColumnFilter)
        newMergeParams = { ColumnFilter }
        sessionStorage.setItem('seachQuery', ColumnFilter)
      }

      yield put(
        routerRedux.push({
          pathname,
          query: {
            ...query,
            pageIndex: 1,
            ...newMergeParams
          }
        })
      )
    },
    * searchKeyword ({ payload: keyword }, { select, call, put }) {
      const { simpleSearchKey } = yield select(
        ({ entcommDynamic }) => entcommDynamic
      )
      const searchData = JSON.stringify({
        [simpleSearchKey]: keyword || undefined
      })
      yield put({ type: 'search', payload: { searchData, isAdvanceQuery: 0 } })
    },
    * cancelFilter ({ payload }, { put }) {
      yield put({ type: 'search', payload: { ColumnFilter: payload } })
      yield put({ type: 'putState', payload: { ColumnFilter: payload } })
    },
    * queryList (action, { select, call, put }) {
      const location = yield select(
        ({ routing }) => routing.locationBeforeTransitions
      )
      let { query } = location
      const { entityId, ColumnFilter } = yield select(
        ({ entcommDynamic }) => entcommDynamic
      )
      const seachQuery = sessionStorage.getItem('seachQuery')
      if (!ColumnFilter && query.ColumnFilter) {
        let filterParams = null
        if (seachQuery && seachQuery !== '{}') {
          filterParams = JSON.parse(seachQuery)
        } else {
          filterParams = JSON.parse(query.ColumnFilter)
        }
        query = { ...query, ColumnFilter: filterParams }
        yield put({
          type: 'putState',
          payload: { ColumnFilter: query.ColumnFilter }
        })
      }

      const queries = {
        entityId,
        pageIndex: 1,
        pageSize: 10,
        menuId: '75ce6617-2016-46f0-8cb4-8467b77ef468',
        keyword: '',
        isAdvanceQuery: 0,
        ...query
      }
      queries.pageIndex = parseInt(queries.pageIndex, 10)
      queries.pageSize = parseInt(queries.pageSize, 10)
      queries.isAdvanceQuery = parseInt(queries.isAdvanceQuery, 10)
      if (queries.searchData) {
        queries.searchData = JSON.parse(queries.searchData)
      }
      if (ColumnFilter) queries.ColumnFilter = ColumnFilter
      yield put({
        type: 'putState',
        payload: { sortFieldAndOrder: queries.searchOrder }
      }) // 其他查询条件 发生改变  排序保持不变
      yield put({ type: 'queries', payload: queries })
      try {
        const params = {
          viewType: 0,
          searchOrder: '',
          ...queries
        }
        delete params.keyword
        const { data } = yield call(getListData, params)
        yield put({
          type: 'queryListSuccess',
          payload: {
            list: data.pagedata,
            total: data.pagecount[0].total
          }
        })
      } catch (e) {
        message.error(e.message || '获取列表数据失败')
      }
    },
    * getDetail ({ payload: recid }, { select, call, put }) {
      const { entityId } = yield select(({ entcommDynamic }) => entcommDynamic)
      const { data } = yield call(getDynamicDetail, {
        entityId,
        recid
      })
      yield put({
        type: 'putState',
        payload: { showModals: 'detail', detailData: data }
      })
    },
    * like ({ payload: id }, { put, call }) {
      try {
        yield call(likeEntcommActivity, id)
        yield put({ type: 'updateActivity', payload: id })
      } catch (e) {
        message.error(e.message || '点赞失败')
      }
    },
    * comment (
      {
        payload: { id, content }
      },
      { put, call }
    ) {
      try {
        const params = {
          dynamicid: id,
          comments: content
        }
        yield call(commentEntcommActivity, params)
        yield put({ type: 'updateActivity', payload: id })
        // message.success('评论成功');
      } catch (e) {
        message.error(e.message || '评论失败')
      }
    },
    * updateActivity ({ payload: id }, { select, put, call }) {
      try {
        const { data } = yield call(getActivityDetail, id)
        yield put({ type: 'putState', payload: { detailData: data } })
      } catch (e) {
        message.error(e.message || '更新数据失败')
      }
    },
    * showDynamicDetail ({ payload: item }, { select, put, call }) {
      yield put({
        type: 'putState',
        payload: {
          showDetailModals: `recordDetail?${item.entityid}:${item.businessid}`
        }
      })
    }
  },
  reducers: {
    entityName (state, { payload: entityName }) {
      return { ...state, entityName }
    },
    entityTypes (state, { payload: entityTypes }) {
      return {
        ...state,
        entityTypes
      }
    },
    entityId (state, { payload: entityId }) {
      return { ...state, entityId }
    },
    protocol (state, { payload: protocol }) {
      return { ...state, protocol }
    },
    queries (state, { payload: queries }) {
      return { ...state, queries }
    },
    queryListSuccess (
      state,
      {
        payload: { list, total }
      }
    ) {
      return {
        ...state,
        list,
        total
      }
    },
    showModals (state, { payload: showModals }) {
      return {
        ...state,
        showModals,
        modalPending: false
      }
    },
    modalPending (state, { payload: modalPending }) {
      return {
        ...state,
        modalPending
      }
    },
    putState (state, { payload: stateAssignment }) {
      return {
        ...state,
        ...stateAssignment
      }
    },
    resetState () {
      return {
        entityId: '',
        entityName: '',
        entityTypes: [],
        protocol: [],
        queries: {},
        list: [],
        total: 0,
        showModals: '',
        modalPending: false,
        simpleSearchKey: 'recname',
        searchTips: '',
        sortFieldAndOrder: null, // 当前排序的字段及排序顺序
        ColumnFilter: null, // 字段查询
        detailData: {},
        showDetailModals: ''
      }
    }
  }
}
