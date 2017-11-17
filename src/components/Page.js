import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import { Icon } from 'antd';
import styles from './Page.less';

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
  lastLocation = null;

  componentDidMount() {
    const navStack = this.props.navStack;
    this.lastLocation = navStack[navStack.length - 2];
  }

  handleGoBack = () => {
    const { dispatch, goBackPath } = this.props;

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


    if (this.lastLocation) {
      dispatch(routerRedux.push({
        pathname: this.lastLocation.pathname,
        search: this.lastLocation.search
      }));
      return;
    }
    if (goBackPath) {
      dispatch(routerRedux.push({ pathname: goBackPath }));
    } else {
      dispatch(routerRedux.goBack());
    }
  };

  render() {
    const { layout, title, children, fixedTop, showGoBack, contentStyle, contentStyleFree } = this.props;

    return (
      <div className={classnames([styles.page, styles[layout]])}>
        <div className={styles.titleBar}>
          {showGoBack && <Icon onClick={this.handleGoBack} type="left" className={styles.goBackBtn} />}
          <span className={styles.title}>{title}</span>
        </div>
        {fixedTop || ''}
        <div className={styles.content}>
          <div className={contentStyleFree ? '' : styles.contentInner} style={contentStyle}>
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
