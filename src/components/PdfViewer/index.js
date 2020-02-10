import React from 'react';
import { Modal } from 'antd';
import s from './index.less';


class UploadModal extends React.Component {
    
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { file, visible, onCancel, zIndex } = this.props;

    if (!file) return null;
    const origin = window.location.origin;
    const url = `${/localhost/.test(origin) ? 'http://59.33.45.158:702' : origin}/build/generic/web/viewer.html?file=${file.fileid}`;
    return (
      <Modal
        title={file.filename}
        maskClosable={false}
        visible={visible}
        width={'100vw'}
        footer={null}
        onCancel={onCancel}
        wrapClassName={s.wrapModal}
        zIndex={zIndex || 10000}
      >
        <div className={s.content}>
          <iframe src={url} frameBorder={0} />
        </div>
      </Modal>
    );
  }
}

export default UploadModal;
