import React, { PropTypes, Component } from 'react';
import { render } from 'react-dom';
import { Button } from 'antd';
import LoginPage from './routes/Login/LoginPage';
import { getRememberedPwd, login } from './services/authentication';
import { authCompany } from './services/license';
import './styles/main.less';

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
      authCompany: ''
    };
  }

  componentDidMount() {
    this.fetchAuthCompany();
  }

  fetchAuthCompany = () => {
    authCompany().then(result => {
      this.setState({ authCompany: result.data });
    });
  };

  login = data => {
    // const { accountname, accountpwd, rememberpwd } = data;
    this.setState({ loginPending: true });
    login(data).then(result => {
      this.setState({ loginPending: false });
      const { permissionLevel } = result.loginInfo; // 0仅web 1仅管理后台 2都有权限 3无登录权限

      if (permissionLevel === 1 || permissionLevel === 3) {
        location.href = '/';
      } else if (permissionLevel === 2) {
        location.href = '/admin.html';
      } else {
        this.setState({ loginError: '没有足够的登录权限' });
      }
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
      />
    );
  }
}

render(
  <LoginPageContainer />,
  document.getElementById('root')
);
