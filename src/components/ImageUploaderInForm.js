import React from 'react';
import { Upload, Icon, message } from 'antd';
import { connect } from 'dva';
import styles from './ImageUploaderInForm.less';
import { getDeviceHeaders } from '../utils/request';

class ImageUploaderInForm extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    token: React.PropTypes.string,
    tips: React.PropTypes.arrayOf(React.PropTypes.node)
  };
  static defaultProps = {
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
    if (file.response && file.response.error_code === 0) {
      // 上传成功，拿uuid
      const fileId = file.response.data;
      this.props.onChange(fileId);
    }
  };

  beforeUpload = file => {
    // const isLt2M = file.size / 1024 / 1024 < 2;
    let isImage = false;
    isImage = /jpeg|jpg|png|gif|bmp/.test(file.type);
    if (!isImage) {
      message.error('图片格式有误，请重新选择!');
    }
    if (isImage && file.size > 1024 * 200) {
      message.error('文件大于200k')
      isImage = false;
    }
    return isImage;
  };

  render() {
    let imgUrl = '';
    if (this.props.value) {
      imgUrl = `/api/fileservice/read?fileid=${this.props.value}&filetype=1`;
    }

    return (
      <div className={styles.wrap}>
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
            imgUrl ?
              <img src={imgUrl} alt="" className={styles.img} /> :
              <Icon type="plus" className={styles.trigger} />
          }
        </Upload>
        <div className={styles.tips}>
          <p>上传要求</p>
          <ul>
            {this.props.tips.map((tip, index) => (
              <li key={index}>{index + 1}. {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({ token: state.app.token })
)(ImageUploaderInForm);
