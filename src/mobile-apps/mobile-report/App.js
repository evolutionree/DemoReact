import React, { PropTypes, Component } from 'react';
import { hasLogin, login } from '../lib/auth';
import log from '../lib/log';
import { queryUserInfo } from '../../services/structure';
import DebugLog from './DebugLog';
import styles from './main.less';
import env from '../lib/enviroment';

class App extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const _hasLogin = hasLogin();
    if (!_hasLogin) {
      login()
        .then(queryUserInfo, loginError => {
          log.log('登录失败: ' + loginError.message);
        })
        .then(result => {
          log.log('获取到用户信息: ' + JSON.stringify(result));
        }, err => {
          log.log('获取用户信息失败： ' + err.message);
        });
    } else {
      log.log('当前已登录');
    }
  }

  render() {
    return (
      <div className={styles.app}>
        {env.debug && <DebugLog />}
      </div>
    );
  }
}

export default App;
