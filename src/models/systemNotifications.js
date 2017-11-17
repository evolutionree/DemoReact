import { message } from 'antd';
import { getData, saveConfig, saveItemConfig } from '../services/systemnotifications';

export default{

	namespace: 'systemNotifications',
	state: {
		systemNotifications:undefined
	},

	subscriptions: {
        setup({dispatch, history}) {
            return history.listen(location => {
                if (location.pathname === '/systemnotifications') {
                    dispatch({
                        type: 'query'
                    });
                }
            });
        }
    },

	effects:{
		*query(action,{call, put}){
			try{
				const {data} = yield call(getData);
				const dataInfo = data;
	                yield put({
	                    type: 'querySuccess',
	                    payload: dataInfo
	                });
            } catch ( e ) {
                message.error(e.message || '查询失败');
            }
		},

		*save({payload:{items,configList,setTypeList}},{call,put}){
			try{
				yield call(saveConfig,items);
				yield call(saveItemConfig,configList,setTypeList);
				const {data} = yield call(getData);
				const dataInfo = data;
	                yield put({
	                    type: 'querySuccess',
	                    payload: dataInfo
	                });
	            message.success('保存成功')
            } catch ( e ) {
                message.error(e.message || '保存失败');
            }
		}

	},

    reducers: {
	    querySuccess(state, { payload : systemNotifications }) {
	      return {
	        ...state,
	        systemNotifications
	      };
	    }
    }

};
