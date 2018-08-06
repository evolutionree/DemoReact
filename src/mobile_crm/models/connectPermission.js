import React, { Component } from 'react';
import { connect } from 'dva';

/**
 * connect用户功能权限
 * @param entityId {string|function}
 * @param WrappedComponent
 * @returns {*}
 */
export default function connectPermission(entityId, WrappedComponent) {
  const getEntityId = typeof entityId === 'string' ? null : entityId;
  class ConnectPermission extends Component {
    static propTypes = {
      funcs: React.PropTypes.array,
      dispatch: React.PropTypes.func
    };
    static defaultProps = {
      funcs: []
    };
    componentDidMount() {
      const entid = getEntityId ? getEntityId(this.props) : entityId;
      if (!entid) return;
      this.props.dispatch({
        type: 'permission/queryPermission',
        payload: entid
      });
    }
    componentWillReceiveProps(nextProps) {
      if (getEntityId && (getEntityId(this.props) !== getEntityId(nextProps))) {
        const entid = getEntityId(nextProps);
        if (!entid) return;
        this.props.dispatch({
          type: 'permission/queryPermission',
          payload: entid
        });
      }
    }
    getWrappedInstance = () => {
      return this.wrappedInstance;
    };
    checkFunc = funcCode => {
      if ((this.props.funcs && this.props.funcs instanceof Array && this.props.funcs.length === 0) || this.props.funcsStatus === 0 || this.props.funcsStatus === 1) {
        //不return 0  toolbar做了判断，不返回boolean就会执行返回值
      } else {
        return this.props.funcs && this.props.funcs instanceof Array && this.props.funcs.some(item => item.funccode === funcCode);
      }
    };
    render() {
      const props = {
        ...this.props,
        checkFunc: this.checkFunc.bind(this), // 返回新的函数，触发更新
        ref: inst => { this.wrappedInstance = inst; }
      };
      return (
        <WrappedComponent {...props} />
      );
    }
  }
  return connect(
    (state, ownProps) => {
      const entId = getEntityId ? getEntityId(ownProps) : entityId;
      const funcs = state.permission.permissionFuncs[entId] || [];
      const funcsStatus = state.permission.dataStatus[entId];
      return { funcs, funcsStatus };
    },
    undefined,
    undefined,
    { withRef: true }
  )(ConnectPermission);
}
