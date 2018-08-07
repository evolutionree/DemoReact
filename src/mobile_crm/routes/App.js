/**
 * Created by 0291 on 2018/8/6.
 */
import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import styles from './App.less';

function App({ dispatch, children, loading }) {
  return (
    <div className={styles.appLayout}>
      <Spin spinning={!!loading}>
        {children}
      </Spin>
    </div>
  );
}

App.propTypes = {
};

export default connect(state => ({ ...state.app, loading: state.loading > 0 }))(App);
