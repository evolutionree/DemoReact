/**
 * Created by 0291 on 2018/5/11.
 */
import { message } from 'antd';
import { queryTypes, getfunctionconfig, updatefuncconfig } from '../services/entity';
import _ from 'lodash';

export default {
  namespace: 'extendconfig',
  state: {
    menus: [],
    currentMenu: '', // 存的是id
    functionconfig: null
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(location => {
        const pathReg = /^\/entity-config\/([^/]+)\/([^/]+)\/extendconfig/;
        const match = location.pathname.match(pathReg);
        if (match) {
          const entityId = match[1];
          const entityType = match[2];
          dispatch({
            type: 'gotEntityInfo',
            payload: {
              entityId,
              entityType
            }
          });
          dispatch({
            type: 'init'
          });
        } else {
          dispatch({ type: 'resetState' });
        }
      });
    }
  },
  effects: {
    *init(action, { select, put, call }) {
      yield put({ type: 'queryMenus' });
    },
    *queryMenus(action, { select, put, call }) {
      const { entityId } = yield select(({ extendconfig }) => extendconfig);
      let menus = [];
      const result = yield call(queryTypes, { entityId });
      menus = result.data.entitytypepros.map(item => ({
        menuName: item.categoryname,
        menuId: item.categoryid
      }));
      yield put({ type: 'queryMenusSuccess', payload: menus });
      yield put({ type: 'queryExtendConfig' });
    },
    *queryExtendConfig(action, { select, put, call }) {
      const { entityId, menus } = yield select(({ extendconfig }) => extendconfig);
      try {
        let { data } = yield call(getfunctionconfig, entityId);
        let funcevent = data.funcevent;
        for (let i = 0; i < menus.length; i++) {
          let menuFunceventData = funcevent[menus[i].menuId];
          if (menuFunceventData && menuFunceventData instanceof Array && menuFunceventData.length > 0) {
            let operatetypeArray = []; //存在哪些 操作数据 不够需要造 0新增 1修改 2详情 3列表 4删除
            menuFunceventData.map(item => {
              operatetypeArray.push(item.operatetype);
            });
           for (let h = 0; h < 5; h++) {
             if (operatetypeArray.indexOf(h) > -1) {} else {
               funcevent[menus[i].menuId].push({
                 typeid: menus[i].menuId,
                 operatetype: h,
                 funcname: ''
               });
             }
           }
          } else {
            funcevent[menus[i].menuId] = [];
            for (let h = 0; h < 5; h++) {
              funcevent[menus[i].menuId].push({
                typeid: menus[i].menuId,
                operatetype: h,
                funcname: ''
              });
            }
          }
        }

        const acconfigData = data.acconfig;
        let acconfigTableData = [];
        if (acconfigData && acconfigData instanceof Array && acconfigData.length > 0) {
          let funcKey = acconfigData[0].routepath;
          let funcKeyGroup = { [funcKey]: [] };
          for (let i = 0; i < acconfigData.length; i++) {
            if (funcKeyGroup[acconfigData[i].routepath] instanceof Array) {
              funcKeyGroup[acconfigData[i].routepath].push(acconfigData[i]);
            } else {
              funcKeyGroup[acconfigData[i].routepath] = [acconfigData[i]];
            }
          }

          for (let key in funcKeyGroup) {
            let frontKey = '';
            let endKey = '';
            for (let i = 0; i < funcKeyGroup[key].length; i++) {
              if (funcKeyGroup[key][i].operatetype === 0) {
                frontKey = i;
              } else if (funcKeyGroup[key][i].operatetype === 1) {
                endKey = i;
              }
            }
            let obj = {
              routepath: key,
              front: funcKeyGroup[key][frontKey] ? funcKeyGroup[key][frontKey] : {
                routepath: key,
                implementtype: -1
              },
              end: funcKeyGroup[key][endKey] ? funcKeyGroup[key][endKey] : {
                routepath: key,
                implementtype: -1
              }
            };
            acconfigTableData.push(obj);
          }


          let operatetypeArray = []; //存在哪些 操作数据 不够需要造 0新增 1修改 2详情 3列表 4删除
          acconfigTableData.map(item => {
            operatetypeArray.push(item.routepath);
          });

          const apiArray = ['api/dynamicentity/add', 'api/dynamicentity/edit', 'api/dynamicentity/delete'];
          for (let i = 0; i < apiArray.length; i++) {
            if (operatetypeArray.indexOf(apiArray[i]) > -1) {} else {
              acconfigTableData.push({
                routepath: apiArray[i],
                front: {
                  routepath: apiArray[i],
                  implementtype: -1
                },
                end: {
                  routepath: apiArray[i],
                  implementtype: -1
                }
              });
            }
          }
        } else {
          const apiArray = ['api/dynamicentity/add', 'api/dynamicentity/edit', 'api/dynamicentity/delete'];
          for (let i = 0; i < apiArray.length; i++) {
            acconfigTableData.push({
              routepath: apiArray[i],
              front: {
                routepath: apiArray[i],
                implementtype: -1
              },
              end: {
                routepath: apiArray[i],
                implementtype: -1
              }
            });
          }
        }
        data.funcevent = funcevent;
        data.acconfig = acconfigTableData;

        yield put({ type: 'putState', payload: { functionconfig: data } });
      } catch (e) {
        message.error(e.message || '获取数据出错');
      }
    },
    *selectMenu({ payload }, { put, call }) {
      yield put({ type: 'putState', payload: { currentMenu: payload } });
    },
    *submitfuncconfig({ payload }, { select, put, call }) {
      let { entityId, functionconfig } = yield select(({ extendconfig }) => extendconfig);

      let submitData = _.cloneDeep(functionconfig);
      let submitAcconfigData = [];
      let acconfig = submitData.acconfig;
      for (let i = 0; i < acconfig.length; i++) {
        if (!acconfig[i].routepath) {
          return message.error('前置后置函数配置中第【' + (i + 1) + '行】-【功能】名称未填写');
        }

        if (acconfig[i].front.implementtype === 0 && (!acconfig[i].front.funcname)) {
          return message.error('前置后置函数配置中第【' + (i + 1) + '行】-【前置函数】-【字段】未填写');
        }
        if (acconfig[i].end.implementtype === 0 && (!acconfig[i].end.funcname)) {
          return message.error('前置后置函数配置中第【' + (i + 1) + '行】-【后置函数】-【字段】未填写');
        }

        if (acconfig[i].front.implementtype === 1 && (!acconfig[i].front.funcname || !acconfig[i].front.classtypename || !acconfig[i].front.assemblyname)) {
          return message.error('前置后置函数配置中第【' + (i + 1) + '行】-【前置函数】-【字段】未填写完全');
        }
        if (acconfig[i].end.implementtype === 1 && (!acconfig[i].end.funcname || !acconfig[i].end.classtypename || !acconfig[i].end.assemblyname)) {
          return message.error('前置后置函数配置中第【' + (i + 1) + '行】-【后置函数】-【字段】未填写完全');
        }


        if (JSON.stringify(acconfig[i].front) != '{}') {
          submitAcconfigData.push({
            ...acconfig[i].front,
            operatetype: 0 //前置
          });
        }
        if (JSON.stringify(acconfig[i].end) != '{}') {
          submitAcconfigData.push({
            ...acconfig[i].end,
            operatetype: 1 //后置
          });
        }
      }

      submitData.acconfig = submitAcconfigData.map(item => {
        return {
          ...item,
          entityid: entityId
        };
      });

      for (let i = 0; i < submitData.extfunction.length; i++) {
        if (!submitData.extfunction[i].functionname) {
          return message.error('功能扩展配置中第【' + (i + 1) + '行】中【数据库函数名】未填写');
        }
      }

      submitData.extfunction = submitData.extfunction.map(item => {
        return {
          ...item,
          entityid: entityId
        };
      });

      try {
        yield call(updatefuncconfig, {
          entityId,
          ...submitData
        });
        message.success('更新成功');
        yield put({ type: 'queryExtendConfig' });
      } catch (e) {
        message.error(e.message || '更新异常');
      }
    }
  },
  reducers: {
    putState(state, { payload }) {
      return { ...state, ...payload };
    },
    gotEntityInfo(state, { payload: entityInfo }) {
      return {
        ...state,
        entityId: entityInfo.entityId,
        entityType: entityInfo.entityType
      };
    },
    queryMenusSuccess(state, { payload: menus }) {
      return {
        ...state,
        menus,
        currentMenu: menus[0].menuId
      };
    },
    modifyFuncionConfig(state, { payload: newFuncConfig }) {
      return {
        ...state,
        functionconfig: newFuncConfig
      };
    },
    resetState() {
      return {
        menus: [],
        currentMenu: '', // 存的是id
        functionconfig: null
      };
    }
  }
};
