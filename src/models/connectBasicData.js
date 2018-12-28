import React, { Component } from 'react';
import { connect } from 'dva';
import _ from 'lodash';

/**
 * 用于基础数据懒加载
 * @param key
 * @param WrappedComponent
 * @returns {*}
 */
export default function connectBasicData(key, WrappedComponent) {
  class ConnectBasicDataComponent extends Component {
    static propTypes = {
      [key]: React.PropTypes.any,
      dispatch: React.PropTypes.func
    };
    static defaultProps = {};
    constructor(props) {
      super(props);
      this.state = {
        data: _.cloneDeep(props[key]) // 保存基础数据的深拷贝
      };
    }
    componentDidMount() {
      this.props.dispatch({
        type: 'basicData/__fetchData',
        payload: key
      });
    }
    componentWillReceiveProps(nextProps) {
      if (this.props[key] !== nextProps[key]) {
        this.setState({
          data: _.cloneDeep(nextProps[key])
        });
      }
    }
    getWrappedInstance = () => {
      return this.wrappedInstance;
    };
    render() {
      const props = {
        ...this.props,
        [key]: this.state.data,
        ref: inst => { this.wrappedInstance = inst; }
      };
      return (
        <WrappedComponent {...props} />
      );
    }
  }
  return connect(
    state => {
      return {
        [key]: state.basicData[key]
      };
    },
    undefined,
    undefined,
    { withRef: true }
  )(ConnectBasicDataComponent);
}
