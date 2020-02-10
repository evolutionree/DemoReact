import { message } from 'antd'
import { queryFlowJSONv2 } from '../services/workflow'
import { queryFields, queryEntityDetail } from '../services/entity'
import { getreportrelation } from '../services/reportrelation'
import { dynamicRequest } from '../services/common'
import { parseRuleDetail, ruleListToItems, getAllFields } from '../components/FilterConfigBoard';
import { getIntlText } from '../components/UKComponent/Form/IntlText'

const NAMESPACE = 'workflowNotify'

export default {
  namespace: NAMESPACE,
  state: {
    flowId: '',
    flowEntities: [],
    list: [],
    confimloading: false
  },
  effects: {
    *Init({ payload }, { put }) {
      const { flowId } = payload
      yield put({ type: 'putState', payload: { flowId } })
      yield put({ type: 'queryFlowJSON' });
    },
    *queryFlowJSON(_, { select, put, call }) {
      const { flowId } = yield select(state => state[NAMESPACE]);
      try {
        const { data } = yield call(queryFlowJSONv2, flowId)

        const flowInfo = data.flow[0]
        yield put({ type: 'queryFlowEntity', payload: flowInfo })
      } catch (e) {
        message.error(e.message || '获取流程数据失败')
      }
    },
    * queryFlowEntity({ payload: flowInfo }, { put, call }) {
      try {
        const { entityid, entityname, relentityid, relentityname } = flowInfo
        const { data } = yield call(queryFields, entityid)
        const { data: entityDetail } = yield call(queryEntityDetail, entityid) // 获取实体数据

        const entityproinfo = Array.isArray(entityDetail.entityproinfo)
          ? entityDetail.entityproinfo.map(item => ({ ...item, displayname: getIntlText('entityname', item) }))
          : []

        let entityproinfo2 = []

        if (relentityid && relentityname) {
          // 获取关联实体数据
          const { data: meta20 } = yield call(queryEntityDetail, relentityid)
          entityproinfo2 = Array.isArray(meta20.entityproinfo)
            ? meta20.entityproinfo.map(item => ({ ...item, displayname: getIntlText('entityname', item) }))
            : []
        }
        const forms = [...entityproinfo, ...entityproinfo2]

        const { data: reportrelation } = yield call(getreportrelation, {})
        const reportrelationList = Array.isArray(reportrelation.datalist)
          ? reportrelation.datalist.map(item => ({ ...item, displayname: item.reportrelationname }))
          : []

        const flowEntities = [
          {
            entityid,
            entityname,
            fields: data.entityfieldpros,
            forms,
            reportrelationList
          }
        ]

        if (relentityid && relentityname) {
          const { data: data2 } = yield call(queryFields, relentityid)

          flowEntities.push({
            entityid: relentityid,
            entityname: relentityname,
            fields: data2.entityfieldpros
          })
        }
        yield put({ type: 'putState', payload: { flowEntities } })
        yield put({ type: 'QueryList' });
      } catch (e) {
        message.error(e.message || '获取流程实体数据失败')
      }
    },
    *QueryList({ payload }, { put, call, select }) {
      if (payload && payload.action == 'clear') {
        yield put({ type: 'putState', payload: { list: [] } })
        return
      }

      const { flowId, flowEntities } = yield select(state => state[NAMESPACE])
      const allFields = getAllFields(flowEntities)

      try {
        const url = '/api/workflow/getinformerrule'
        const params = { flowid: flowId }
        const { data } = yield call(dynamicRequest, url, params);

        if (Array.isArray(data)) {
          const list = data.map((item, index) => {
            const { ruleList, ruleSet } = parseRuleDetail(item.rules && item.rules[0]);

            return {
              flowid: item.flowid,
              ruleid: item.ruleid,
              rules: Array.isArray(item.rules) ? item.rules : [],
              rulename: { value: item.rules[0] && item.rules[0].rulename },
              type: { value: item.type },
              informertype: { value: item.informertype },
              user: { value: item.user || {} },
              reportrelation: { value: item.reportrelation || { type: '1' } },
              spfuncname: { value: item.funcname },
              rule: {
                typeid: 3,
                entityid: flowEntities[0].entityid,
                relentityid: flowEntities[1] && flowEntities[1].entityid,
                rulename: item.rules[0] ? item.rules[0].rulename : '',
                ruleitems: ruleListToItems(ruleList, allFields, flowEntities[0].entityid),
                ruleset: {
                  ruleset: ruleSet,
                  userid: 0,
                  ruleformat: ''
                },
                flowid: flowId
              }
            }
          })
          yield put({ type: 'putState', payload: { list } })
        }
      } catch (e) {
        message.error(e.message || '获取列表失败')
      }
    },
    *SaveList({ payload }, { put, call }) {
      try {
        const { params } = payload;
        yield put({ type: 'putState', payload: { confimloading: true } })
        const res = yield call(dynamicRequest, '/api/workflow/saveinformer', params);
        message.success(res.error_msg || '保存成功');
        yield put({ type: 'putState', payload: { confimloading: false } })
        yield put({ type: 'QueryList' });
      } catch (e) {
        yield put({ type: 'putState', payload: { confimloading: false } })
        message.error(e.message || '保存失败');
      }
    },
  },
  reducers: {
    putState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  }
}