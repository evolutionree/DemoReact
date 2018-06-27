/**
 * Created by 0291 on 2018/6/26.
 */
import React from 'react';
import { Upload, Icon, message } from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import { getDeviceHeaders } from '../../../../../utils/request';

class ImageUploaderInForm extends React.Component {
  static propTypes = {
    type: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    token: React.PropTypes.string,
    tips: React.PropTypes.arrayOf(React.PropTypes.node)
  };
  static defaultProps = {
    type: 'file',
    tips: [
      '图片格式jpg，png，jpeg',
      '文件大小不超过200k',
      '长宽比约为4:3'
    ]
  };

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
    if (file.response) {
      if (file.response.error_code === 0) {
        // 上传成功，拿uuid
        const fileId = file.response.data;
        this.props.onUpload && this.props.onUpload({
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
    let isUpload = true;
    if (this.props.type === 'img') {
      // const isLt2M = file.size / 1024 / 1024 < 2;
      isUpload = /jpeg|jpg|png|gif|bmp/.test(file.type);
      if (!isUpload) {
        message.error('图片格式有误，请重新选择!');
      }
      if (isUpload && file.size > 1024 * 200) {
        message.error('文件大于200k')
        isUpload = false;
      }
    } else {
      if (file.size / 1024 / 1024 > 100) {
        message.error('文件大小不可超过100M!');
        isUpload = false;
      }
      return true;
    }
    if (isUpload) {
      this.props.startUpload && this.props.startUpload(file);
    }
    return isUpload;
  };

  render() {
    // let imgUrl = '';
    // if (this.props.value) {
    //   imgUrl = `/api/fileservice/read?fileid=${this.props.value}&filetype=1`;
    // }
    return (
      <Upload
        className={styles.uploader}
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
        {
          this.props.children
        }
      </Upload>
    );
  }
}

export default connect(
  state => ({ token: state.app.token })
)(ImageUploaderInForm);
