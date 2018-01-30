import React from 'react';
import { connect } from 'dva';
import { Modal, Upload, Icon, message } from 'antd';
import styles from './ModifyAvatarModal.less';
import { getDeviceHeaders } from '../../utils/request';

function beforeUpload(file) {
  const isImage = /jpeg|jpg|png|gif|bmp/.test(file.type);
  if (!isImage) {
    message.error('图片格式有误，请重新选择!');
  }
  return isImage;
}

class ModifyAvatarModal extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      fileId: '',
      uploadHeaders: {
        ...getDeviceHeaders(),
        Authorization: 'Bearer ' + props.token
      }
    };
    const { user } = props;
    if (user.usericon) {
      this.state.fileId = user.usericon;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fileId: nextProps.user.usericon,
      uploadHeaders: {
        ...getDeviceHeaders(),
        Authorization: 'Bearer ' + nextProps.token
      }
    });
  }

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  handleChange = ({ file }) => {
    if (file.response && file.response.error_code === 0) {
      // 上传成功，拿uuid
      this.setState({
        fileId: file.response.data
      });
    }
  };

  handleOk = () => {
    const { cancel, modifyAvatar, user } = this.props;
    if (user.usericon === this.state.fileId) {
      // 没改头像
      cancel();
    } else {
      modifyAvatar(this.state.fileId);
    }
  };

  render() {
    const { showModals, cancel } = this.props;
    const fileId = this.state.fileId;
    let imageUrl = '';
    if (fileId) {
      imageUrl = `/api/fileservice/read?fileid=${fileId}&filetype=3`;
    }
    return (
      <Modal
        title="修改头像"
        visible={/avatar/.test(showModals)}
        onCancel={this.props.cancel}
        onOk={this.handleOk}
      >
        <div className={styles.wrap}>
          <Upload
            className={styles.uploader}
            name="data"
            data={this.getUploadParams}
            showUploadList={false}
            action="/api/fileservice/upload"
            beforeUpload={beforeUpload}
            onChange={this.handleChange}
            headers={this.state.uploadHeaders}
          >
            {
              imageUrl ?
                <img src={imageUrl} alt="" className={styles.img} /> :
                <Icon type="plus" className={styles.trigger} />
            }
          </Upload>
          <div className={styles.tips}>
            头像上传要求 <br />
            1、建议使用正方形的图片 <br />
            2、图片格式jpg、png、jpeg
          </div>
        </div>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    ...state.auth,
    ...state.app
  }),
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'app/showModals', payload: '' });
      },
      modifyAvatar: fileId => {
        dispatch({ type: 'app/modifyAvatar', payload: fileId });
      }
    };
  }
)(ModifyAvatarModal);
