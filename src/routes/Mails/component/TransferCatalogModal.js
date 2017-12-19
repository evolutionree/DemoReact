import React, { PropTypes, Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import UserSelectModal from '../../../components/DynamicForm/controls/UserSelectModal';

const TransferCatalogModal = connect(
  state => {
    const { showingModals, modalPending } = state.mails;
    return {
      visible: /transferCatalog/.test(showingModals),
      selectedUsers: [],
      multiple: false,
      title: '选择文件夹的接收人',
      modalPending
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'mails/showModals', payload: '' });
      },
      onOk(users) {
        if (!users.length) return message.error('请选择人员');
        dispatch({ type: 'mails/transferCatalog', payload: users[0].id });
      }
    };
  }
)(UserSelectModal);

export default TransferCatalogModal;
