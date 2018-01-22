/**
 * Created by 0291 on 2018/1/16.
 */
import React from 'react';

class NoPermission extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: document.body.clientHeight
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize(e) {
    this.setState({
      height: document.body.clientHeight
    });
  }
  render() {
    const height = (this.state.height - 60) > 500 ? (this.state.height - 60) : 500;
    const paddingTop = parseInt(height * 0.18);
    return (
      <div style={{ height: height, background: '#3398db', paddingTop: paddingTop + 'px' }}>
        <div style={{ textAlign: 'center', fontSize: '16px' }}>
          <img src="/icon/noPermissionIcon.png" />
          <div style={{ paddingTop: '30px', paddingBottom: '66px', color: '#ffffff', fontSize: '18px' }}>系统管理员尚未为您分配系统权限，请联系系统管理员</div>
          <a href="/login.html" style={{ padding: '5px 40px', border: '1px solid #ffffff', borderRadius: '4px', color: '#ffffff', fontSize: '20px' }}>返回</a>
        </div>
      </div>
    );
  }
}

export default NoPermission;
