import { message } from 'antd';
import { authLicenseInfo } from '../services/license';

export default {
    namespace: 'licenseInfo',
    state: {
        licenseInfo: undefined
    },

    subscriptions: {
        setup({dispatch, history}) {
            return history.listen(location => {
                if (location.pathname === '/licenseinfo') {
                    dispatch({
                        type: 'query'
                    });
                }
            });
        }
    },

    effects: {
        *query(action, {put, call}) {
            try {
                const {data} = yield call(authLicenseInfo);
                const authInfo = data;
                yield put({
                    type: 'querySuccess',
                    payload: authInfo
                });
            } catch ( e ) {
                message.error(e.message || '查询失败');
            }
        }
    },

    reducers: {
        querySuccess(state, {payload: licenseInfo}) {
            return {
                ...state,
                licenseInfo
            };
        }
    }
}
