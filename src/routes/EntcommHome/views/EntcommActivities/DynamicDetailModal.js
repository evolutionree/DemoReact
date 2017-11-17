import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import EntcommDetailModal from '../../../../components/EntcommDetailModal';

const DynamicDetailModal = connect(
  state => {
    const { showModals } = state.entcommActivities;
    const match = showModals.match(/dynamicDetail\?([^:]+):(.+)$/);
    return {
      visible: !!match,
      entityId: match && match[1],
      recordId: match && match[2]
    };
  },
  dispatch => {
    const hideModal = () => {
      dispatch({ type: 'entcommActivities/putState', payload: { showModals: '' } });
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

export default DynamicDetailModal;
