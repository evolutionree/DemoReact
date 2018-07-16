/**
 * Created by 0291 on 2018/4/26.
 * 国际版(多语言)容器
 */
import React, { Component } from 'react';

const IntlWrap = WrappedComponent => {
  return class extends Component {
    render() {
      return (
        <WrappedComponent {...this.props} />
      );
    }
  };
}
export default IntlWrap;
