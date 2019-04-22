import React, { Component } from 'react';
import { Modal, Table, Button } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

function colRender(key) {
  return (text, record) => record[key] || '---';
}

const columns = [
  {
    title: '设备类型',
    render: colRender('devicetype'),
    key: 'devicetype'
  },
  {
    title: '设备ID',
    render: (text, { deviceid }) => deviceid ? `${deviceid}${deviceid === sessionStorage.getItem('uke_DeviceId') ? '(本机)' : ''}` : '---',
    key: 'deviceid'
  },
  {
    title: '设备描述',
    render: colRender('sysmark'),
    key: 'sysmark'
  },
  {
    title: '登录时间',
    render: (text, { requesttimestamp }) => requesttimestamp ? moment(requesttimestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '---',
    key: 'requesttimestamp'
  },
  {
    title: '最后更新',
    render: colRender('lastrequesttimestamp'),
    key: 'lastrequesttimestamp'
  },
  {
    title: '有效期',
    render: colRender('expiration'),
    key: 'expiration'
  },
  {
    title: '操作',
    key: 'opt'
  }
];

class LoginInfoModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.columns = columns.map(c => c.key !== 'opt' ? c : { ...c, render: this.renderOpt });
  }

  componentWillReceiveProps(nextProps) {
    const { getLoginInfoList, visible, user = {} } = nextProps;
    if (!this.props.visible && visible && user.userid) {
      getLoginInfoList(nextProps.user.userid);
    }
  }

  renderOpt = (text, record) => {
    return <a onClick={() => this.logout(record.deviceid)}>注销</a>;
  }

  logout = DeviceId => {
    const { forceDeviceLogout, user } = this.props;
    forceDeviceLogout([
      {
        UserId: user.userid,
        ForceType: 3,
        DeviceId
      }
    ]);
  }

  render() {
    const { liginInfoList } = this.props;
    return (
      <Modal
        title="用户登录信息查询"
        width={1000}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        footer={[
          <Button key="cancel" onClick={this.props.onCancel}>关闭</Button>
        ]}
      >
        {liginInfoList.length ? <Table
            dataSource={this.props.liginInfoList}
            columns={this.columns}
            pagination={false}
            rowKey={'deviceid'}
        /> : <div style={{ textAlign: 'center' }}>该用户没有可用的登录信息</div>}
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { currentItems, liginInfoList, showModals } = state.structure;
    const user = currentItems.length === 1 ? currentItems[0] : {};
    return {
      visible: /loginInfo/.test(showModals),
      user,
      liginInfoList
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'structure/showModals', payload: '' });
      },
      getLoginInfoList(UserId) {
        dispatch({ type: 'structure/getLoginInfoList', payload: UserId });
      },
      forceDeviceLogout(payload) {
        dispatch({ type: 'structure/forceDeviceLogout', payload });
      }
    };
  }
)(LoginInfoModal);
