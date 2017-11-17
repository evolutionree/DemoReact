import React from 'react';
import { Modal } from 'antd';
import createModal from '../components/createModal';

function TestModal({
  visible,
  cancel,
  close,
  testList = []
}) {
  return (
    <Modal visible={visible} onOk={close} onCancel={cancel}>
      test modal
      {testList && testList.length ? JSON.stringify(testList) : 'loading testList...'}
    </Modal>
  );
}

export default createModal({
  modalName: 'testModal',
  shouldOpen: state => {
    debugger;
    return true;
  },
  willOpen: ({ state, resolve }) => {
    debugger;
    setTimeout(() => {
      resolve({
        testList: [{ name: 'hoga', sex: 'male' }]
      });
    }, 1000);
  }
})(TestModal);
