import React, { PropTypes, Component } from 'react';
import { render } from 'react-dom';
import { Button, Modal, message } from 'antd';
import LoginPage from './routes/Login/LoginPage';
import { getRememberedPwd, login, setLogin, modifyPassword } from './services/authentication';
import { authCompany, ssologinwithdingtalk, apploginwithdingtalk } from './services/license';
import './styles/main.less';
import { GetArgsFromHref } from '../src/utils/index';

const dingdingUrlCode = GetArgsFromHref('code');
const backendOrigin = GetArgsFromHref('backendOrigin')

function setDefaultProps(Component, defaultProps) {
  Component.defaultProps = {
    ...Component.defaultProps,
    ...defaultProps
  };
}
setDefaultProps(Button, {
  size: 'default',
  type: 'primary'
});

class LoginPageContainer extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loginPending: false,
      loginError: null,
      rememberedPwd: getRememberedPwd(),
      authCompany: '',
      loginInfo: null,
      modifyPwdVisible: false //登录页 是否 显示 修改密码  表单
    };
  }

  componentDidMount() {
    localStorage.removeItem('defaultPathType');
    this.fetchAuthCompany();
    if (backendOrigin && dingdingUrlCode) {
      apploginwithdingtalk({ code: dingdingUrlCode }).then(result => { //考虑是否需要走权限
        const loginInfo = {
          user: {
            userNumber: result.data.usernumber
          },
          token: result.data.access_token,
          permissionLevel: 3
        };
        location.href = '/';
        setLogin(loginInfo);
      });
    } else if (dingdingUrlCode) {
      ssologinwithdingtalk({ code: dingdingUrlCode }).then(result => {
        const loginInfo = {
          user: {
            userNumber: result.data.usernumber
          },
          token: result.data.access_token,
          permissionLevel: 3
        };
        location.href = '/';
        setLogin(loginInfo);
      });
    }
  }

  fetchAuthCompany = () => {
    authCompany().then(result => {
      this.setState({ authCompany: result.data });
    });
  };

  modifyPwd = (data) => {
    const { user: { userNumber }, token } = this.state.loginInfo;
    const params = { accountid: 0, userid: userNumber, ...data };
    modifyPassword(params, {
      Authorization: `Bearer ${token}`
    }).then(result => {
      message.success('密码修改成功,请重新登录系统');
      this.setState({
        modifyPwdVisible: false,
        loginError: null
      });
    }).catch((e) => {
      this.setState({ loginError: e.message || '修改密码失败' });
    });
  }

  confirmLogin = (policy_msg) => {
    Modal.confirm({
      title: '是否修改密码',
      content: policy_msg, //'密码即将过期,是否立即修改密码'
      okText: '修改密码',
      cancelText: '继续登录',
      onCancel: () => {
        this.go();
      },
      onOk: () => {
        this.setState({
          modifyPwdVisible: true
        });
      }
    });
  }

  go = () => {
    const { permissionLevel } = this.state.loginInfo;
    if (permissionLevel === 1 || permissionLevel === 3) { // 0仅web 1仅管理后台 2都有权限 3无登录权限
      location.href = '/';
      setLogin(this.state.loginInfo);
    } else if (permissionLevel === 2) {
      location.href = '/admin.html';
      setLogin(this.state.loginInfo);
    } else {
      this.setState({ loginError: '没有足够的登录权限' });
    }
  }

  login = data => {
    // const { accountname, accountpwd, rememberpwd } = data;
    this.setState({ loginPending: true });
    login(data).then(result => {
      this.setState({ loginPending: false, loginInfo: result.loginInfo });
      const { security: { policy_reuslt, policy_msg } } = result.loginInfo;   //security.policy_reuslt: 1 则密码即将过期  2,密码已过期

      if (policy_reuslt === 1) {
        this.confirmLogin(policy_msg);
      } else if (policy_reuslt === 2) { //密码过期 需要修改密码
        this.setState({
          modifyPwdVisible: true,
          loginError: policy_msg
        });
      } else {
        this.go();
      }

     //this.go();
    }, err => {
      this.setState({
        loginPending: false,
        loginError: err.message || '登录失败'
      });
    });
  };


  render() {
    return (
      <LoginPage
        pending={this.state.loginPending}
        loginError={this.state.loginError}
        authCompany={this.state.authCompany}
        rememberedPwd={this.state.rememberedPwd}
        login={this.login}
        modifyPwdVisible={this.state.modifyPwdVisible}
        onModifyPwd={this.modifyPwd}
      />
    );
  }
}

render(
  <LoginPageContainer />,
  document.getElementById('root')
);
