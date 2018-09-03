/**
 * Created by 0291 on 2018/8/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Table } from 'antd';
import styles from './index.less';


class FormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    editingRecord: PropTypes.object,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entities: [],
      currItems: this.props.editingRecord && this.props.editingRecord.rolesid && this.props.editingRecord.rolesid.split(','),
      dataSource: this.props.roles
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      this.setState({
        dataSource: nextProps.roles,
        currItems: nextProps.editingRecord && nextProps.editingRecord.rolesid && nextProps.editingRecord.rolesid.split(',')
      });
    }
  }


  onOk = () => {
    const desktopid = this.props.editingRecord.desktopid;
    const submitData = this.state.currItems.map(item => {
      return {
        desktopid,
        roleid: item
      };
    });
    this.props.confirm(submitData);
  };

  render() {
    const columns = [{
      title: '对象/角色名称',
      dataIndex: 'rolename'
    }, {
      title: '角色说明',
      dataIndex: 'datasources',
      width: 260
    }];
    return (
      <Modal
        title="绑定/解绑"
        visible={this.props.visible}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        wrapClassName="bindmodal"
      >
        <Table rowKey="roleid"
               columns={columns}
               dataSource={this.state.dataSource}
               pagination={false}
               rowSelection={{
                 selectedRowKeys: this.state.currItems,
                 onChange: (selectedRowKeys, selectedRows) => {
                   this.setState({
                     currItems: selectedRowKeys
                   });
                 }
               }} />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending, roles } = state.deskconfig;
    return {
      visible: /bind/.test(showModals),
      editingRecord: /bind/.test(showModals) ? currItems[0] : undefined,
      modalPending,
      roles
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'deskconfig/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'deskconfig/saveRoles', payload: data });
      }
    };
  }
)(Form.create()(FormModal));
