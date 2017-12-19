import React from 'react';
import { connect } from 'dva';
import { Button, Upload, message } from 'antd';
import { getDeviceHeaders } from '../../utils/request';

class UploadButton extends React.Component {
  static propTypes = {
    onUpload: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  handleUploadChange = ({ file }) => {
    if (file.response && file.response.error_code === 0) {
      // 上传成功，拿uuid
      const fileId = file.response.data;
      this.props.onUpload({
        fileId,
        fileName: file.name,
        fileSize: file.size
      });
    }
  };

  beforeUpload = file => {
    // const isJPG = file.type === 'image/jpeg';
    // if (!isJPG) {
    //   message.error('You can only upload JPG file!');
    // }
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error('文件大小不可超过100M!');
    }
    return isLt100M;
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
