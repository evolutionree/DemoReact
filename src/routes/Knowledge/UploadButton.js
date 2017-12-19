import React from 'react';
import { connect } from 'dva';
import { Button, Upload, message } from 'antd';
import { getDeviceHeaders } from '../../utils/request';

class UploadButton extends React.Component {
  static propTypes = {
    onUpload: React.PropTypes.func
  };
  static defaultProps = {};

  hideMsgCallback = null;

  constructor(props) {
    super(props);
    this.state = {
      uploading: false
    };
  }

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  handleUploadChange = ({ file }) => {
    if (file.response) {
      if (this.hideMsgCallback) {
        this.hideMsgCallback();
      }
      this.setState({ uploading: false });

      if (file.response.error_code === 0) {
        // 上传成功，拿uuid
        const fileId = file.response.data;
        this.props.onUpload({
          fileId,
          fileName: file.name,
          fileSize: file.size
        });
      } else {
        message.error(file.response.error_msg || '上传失败');
      }
    }
  };

  beforeUpload = file => {
    if (this.state.uploading) {
      message.error('其他文件正在上传中..');
      return false;
    }
    if (file.size / 1024 / 1024 > 100) {
      message.error('文件大小不可超过100M!');
      return false;
    }
    if (file.size / 1024 / 1024 > 30) {
      this.hideMsgCallback = message.loading('上传文件较大，请耐心等候', 0);
    }
    this.setState({ uploading: true });
    return true;
  };

  render() {
    return (
      <Upload
        name="data"
        data={this.getUploadParams}
        showUploadList={false}
        action="/api/fileservice/upload"
        beforeUpload={this.beforeUpload}
        onChange={this.handleUploadChange}
        headers={{
          ...getDeviceHeaders(),
          Authorization: 'Bearer ' + this.props.token
        }}
      >
        <Button>{this.props.children || '上传文档'}</Button>
      </Upload>
    );
  }
}

export default connect(state => ({ token: state.app.token }))(UploadButton);
