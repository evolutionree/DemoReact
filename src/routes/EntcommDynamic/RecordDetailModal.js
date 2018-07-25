/**
 * Created by 0291 on 2018/7/24.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'antd';
import EntcommDetailModal from '../../components/EntcommDetailModal';

const DetailModal = connect(
  state => {
    const { showDetailModals, entityName } = state.entcommDynamic;
    const match = showDetailModals && showDetailModals.match(/recordDetail\?([^:]+):(.+)$/);
    return {
      visible: !!match,
      entityId: match && match[1],
      recordId: match && match[2],
      entityName
    };
  },
  dispatch => {
    const hideModal = () => {
      dispatch({ type: 'entcommDynamic/putState', payload: { showDetailModals: '' } });
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

export default DetailModal;
