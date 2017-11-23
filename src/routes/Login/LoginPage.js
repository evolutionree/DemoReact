import React from 'react';
import { Alert, Row, Col } from 'antd';
import QRCode from 'qrcode.react';
import LoginForm from './LoginForm';
import styles from './Login.less';

function LoginPage({ login, pending, authCompany, rememberedPwd, loginError }) {
  function handleSubmit(data) {
    login(data);
  }

  return (
    <div className={styles.login}>
      <div className={styles.bg} />
      <div className={styles.box}>
        <div className={styles.logo}>
          <img src="/img_login_logo.png" alt="" />
        </div>
        <Row>
          <Col span={15}>
            <div className={styles.form}>
              <LoginForm onSubmit={handleSubmit} submitBtnLoading={pending} rememberedPwd={rememberedPwd} />
            </div>
            {loginError && <Alert message={`登录出错：${loginError}`} type="error" style={{ margin: '-10px 30px 10px' }} />}
          </Col>
          <Col span={9}>
            <div className={styles.qrcode}>
              <p>打开手机，扫描二维码下载</p>
              <QRCode value="http://116.62.174.138/mcrm/download.html" size={180} />
            </div>
          </Col>
        </Row>
      </div>
      <div className={styles.footer}>
        <p>
          <span style={{ marginRight: '20px' }}>版权所有：广州市玄武无线科技股份有限公司</span>
          <a style={{ color: '#fff', textDecoration: 'underline' }} target="_blank"
             href="http://www.miitbeian.gov.cn">备案号：粤ICP备17055080号</a>
          <span style={{ marginLeft: '20px' }}>授权：{authCompany}</span>
        </p>
      </div>
    </div>
  );
}
LoginPage.propTypes = {
  pending: React.PropTypes.bool,
  loginError: React.PropTypes.string,
  authCompany: React.PropTypes.string,
  login: React.PropTypes.func,
  rememberedPwd: React.PropTypes.shape({
    account: React.PropTypes.string,
    pwd: React.PropTypes.string
  })
};

export default LoginPage;
