import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import { Icon } from 'antd';
import _ from 'lodash';
import styles from './Page.less';

const contentHeight = document.body.clientHeight - 128;

class Page extends Component {
  static propTypes = {
    title: PropTypes.node,
    children: PropTypes.node.isRequired,
    fixedTop: PropTypes.node,
    showGoBack: PropTypes.bool,
    goBackPath: PropTypes.string,
    layout: PropTypes.oneOf(['default', 'center']),
    contentStyle: PropTypes.object,
    contentStyleFree: PropTypes.bool
  };
  static defaultProps = {
    showGoBack: false,
    layout: 'default',
    contentStyleFree: false
  };


  componentDidMount() {
    const navStack = this.props.navStack;
    const lastLocation = navStack[navStack.length - 2];
    if (!this.props.history && lastLocation) { //如果是后退操作 则不往redux【lastLocation】里添加路由  【lastLocation】：记录后退操作需要 退回的路由
      this.props.dispatch({ type: 'navHistory/pushLastLocation', payload: lastLocation });
    }
  }

  handleGoBack = () => {
    const { dispatch, goBackPath, lastLocation } = this.props;

    // FIXED getComponent没有缓存组件导致
    // HACK 临时解决bug739，页面后退功能
    // const { hash } = window.location;
    // const reg = /\/entity-config\/([^/]+)\/([^/]+)/;
    // if (reg.test(hash)) {
    //   const navStack = [...this.props.navStack];
    //   for (let i = navStack.length - 1; i >= 0; i -= 1) {
    //     const nav = navStack[i];
    //     if (!reg.test(nav.pathname)) {
    //       dispatch(routerRedux.push({
    //         pathname: nav.pathname,
    //         search: nav.search
    //       }));
    //       return;
    //     }
    //   }
    //   if (goBackPath) {
    //     dispatch(routerRedux.push({ pathname: goBackPath }));
    //   } else {
    //     dispatch(routerRedux.goBack());
    //   }
    // }


    if (lastLocation.length > 0) {
      const goPath = lastLocation[lastLocation.length - 1]
      dispatch({ type: 'navHistory/putState', payload: { history: true } });
      dispatch({ type: 'navHistory/removeLastLocation' });
      dispatch(routerRedux.push({
        pathname: goPath.pathname,
        search: goPath.search
      }));
      return;
    }
    dispatch({ type: 'navHistory/putState', payload: { history: false } });
    if (goBackPath) {
      dispatch(routerRedux.push({ pathname: goBackPath }));
    } else {
      dispatch(routerRedux.goBack());
    }
  };

  render() {
    const { layout, title, children, fixedTop, showGoBack, contentStyle, contentWrapStyle, contentStyleFree } = this.props;

    return (
      <div className={classnames([styles.page, styles[layout]])}>
        <div className={styles.titleBar}>
          {showGoBack && <Icon onClick={this.handleGoBack} type="left" className={styles.goBackBtn} />}
          <span className={styles.title}>{title}</span>
        </div>
        {fixedTop || ''}
        <div className={styles.content} style={contentWrapStyle}>
          <div className={contentStyleFree ? '' : styles.contentInner} style={{ ...contentStyle, height: contentHeight }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.navHistory
)(Page);
