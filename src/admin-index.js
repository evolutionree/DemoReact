import dva from 'dva';
import { routerRedux } from 'dva/router';
import { message, Table, Pagination, Button, Select, TreeSelect, DatePicker, Modal, Input, Cascader} from 'antd';

function getPopupContainer(elem) {
  if (!elem) return document.body;
  const parentModal = $(elem).parents('.ant-modal-body')[0];
  const entcomminfoBody = $(elem).parents('.entcomminfoBody')[0];
  return parentModal || entcomminfoBody || document.body;
}
function setDefaultProps(Component, defaultProps) {
    Component.defaultProps = {
        ...Component.defaultProps,
        ...defaultProps
    };
}
setDefaultProps(Select, {
    size: 'default',
    getPopupContainer: getPopupContainer,
    showSearch: true,
    optionFilterProp: "children"
});
setDefaultProps(Button, {
    size: 'default',
    type: 'primary'
});
setDefaultProps(Table, {
    bordered: true
});
setDefaultProps(Pagination, {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: val => `共${val}条记录`
});
setDefaultProps(TreeSelect, {
    size: 'default',
    getPopupContainer: getPopupContainer
});
setDefaultProps(DatePicker, {
    size: 'default',
    getCalendarContainer: getPopupContainer
});
setDefaultProps(Modal, {
    maskClosable: false,
    width: 550
});
setDefaultProps(Cascader, {
    getPopupContainer: getPopupContainer
});

// import './index.css';
//
// 1. Initialize
const app = dva({
    initialState: {

    },
    onStateChange() {},
    onError(error, dispatch) {
        console.error(error);
        if (error.response && error.response.status === 401) {
            if (error.error_code === -25012) {
              message.error(error.message, 10);
            }
            dispatch({
              type: 'app/logout'
            });
        } else if (error.errorCode && error.message) {
            message.error(error.message);
        }
    },
    onEffect(effect, {put}, model, actionType) {
        // actionType以后缀__结尾的，不装载loading
        if (/__$/.test(actionType)) {
          return function*(...args) {
            yield effect(...args);
          };
        }
        return function*(...args) {
            yield put({
                type: '@@loading/PUSH'
            });
            yield effect(...args);
            yield put({
                type: '@@loading/POP'
            });
        };
    },
    extraReducers: {
        loading(state = 0, action) {
            if (action.type === '@@loading/PUSH') {
                return state + 1;
            } else if (action.type === '@@loading/POP') {
                return state - 1;
            }
            return state;
        },
        modalManage(state = {
                inRequestModal: '', // 请求显示modal
                currModal: '' // modalName
            }, action) {
            switch (action.type) {
            case 'modalManage/hideModal':
                return {
                    ...state,
                    currModal: ''
                };
            case 'modalManage/requestModal':
                return {
                    ...state,
                    currModal: action.payload
                };
            case 'modalManage/rejectModal':
                if (state.currModal === action.payload) {
                    return {
                        ...state,
                        currModal: ''
                    };
                } else {
                    return state;
                }
            default:
                return state;
            }
        }
    }
});

// 2. Plugins
// app.use();

// 3. Model
app.model(require('./models/app'));
app.model(require('./models/basicData'));
app.model(require('./models/task'));
app.model(require('./models/permission'));
app.model(require('./models/navHistory'));
app.model(require('./models/powerEdit'));
app.model(require('./models/printEntity'));
app.model(require('./models/webIM'));

// 4. Router
app.router(require('./admin-router'));

// 5. Start
app.start('#root');
