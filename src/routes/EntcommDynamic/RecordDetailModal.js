import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import EntcommDetailModal from '../../components/EntcommDetailModal';

const RecordDetailModal = connect(
  state => {
    const { showModals, entityName } = state.entcommDynamic;
    const match = showModals && showModals.match(/recordDetail\?([^:]+):(.+)$/);
    return {
      visible: !!match,
      entityId: match && match[1],
      recordId: match && match[2],
      entityName
    };
  },
  dispatch => {
    const hideModal = () => {
      dispatch({ type: 'entcommDynamic/showModals', payload: '' });
    };
    return {
      footer: [
        <Button key="close" type="default" onClick={hideModal}>
          关闭
        </Button>
      ],
      onCancel() {
        hideModal();
      },
      onOk() {
        hideModal();
      }
    };
  }
)(EntcommDetailModal);

export default RecordDetailModal;
