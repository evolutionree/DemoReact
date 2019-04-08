import React from 'react';
import { Alert, Row, Col } from 'antd';
import LoginForm from './LoginForm';
import ModifyPwdForm from './ModifyPwdForm';
import styles from './Login.less';
import QRCodeUk from '../../components/QRCodeUk';

function LoginPage({ login, pending, authCompany, rememberedPwd, loginError, modifyPwdVisible, onModifyPwd }) {
  function handleSubmit(data) {
    login(data);
  }

  function modifyPwdSubmit(data) {
    onModifyPwd && onModifyPwd(data);
  }

  return (
    <div className={styles.login}>
      <div className={styles.bg} />
      <div className={styles.box} style={{ width: modifyPwdVisible ? '480px' : '680px' }} >
        <div className={styles.logo}>
          <img src="/img_login_logo.png" alt="" width={180} height={70} />
        </div>
        {
          modifyPwdVisible ? (
            <Row>
              <Col span={24}>
                <div className={styles.form}>
                  <ModifyPwdForm onSubmit={modifyPwdSubmit} />
                </div>
                {loginError && <Alert message={`登录出错：${loginError}`} type="error" style={{ margin: '-10px 30px 10px' }} />}
              </Col>
            </Row>
          ) : (
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
                  {/* /!*<img src="/qrcode.png" alt="二维码" />*!/ */}
                  <QRCodeUk size={160} fgColor="#666" />
                </div>
                {/* <div className={styles.qrcode} id="login_container"></div> */}
              </Col>
            </Row>
          )
        }
      </div>
      <div className={styles.footer}>
        <p>
          <span style={{ marginRight: '20px' }}>版权所有：广州仁千信息科技有限公司</span>
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
