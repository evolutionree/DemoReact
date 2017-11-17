import React, { PropTypes, Component } from 'react';
import { Upload, Button, message } from 'antd';
import { connect } from 'dva';
import defaultAvatar from '../../../assets/img_default_avatar.png';
import styles from './Avatar.less';
import { getDeviceHeaders } from '../../../utils/request';

class Avatar extends Component {
  static propTypes = {
    token: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    headShape: PropTypes.oneOf([0, 1]) // 0 方形， 1 圆形
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
      this.props.onChange(fileId);
    }
  };

  beforeUpload = file => {
    // const isLt2M = file.size / 1024 / 1024 < 2;
    const isImage = /jpeg|jpg|png/.test(file.type);
    if (!isImage) {
      message.error('图片格式有误，请重新选择!');
    }
    return isImage;
  };

  render() {
    const { value, headShape } = this.props;
    const imgSrc = value ? `/api/fileservice/read?fileid=${value}` : defaultAvatar
    return (
      <div className={styles.wrap}>
        <div className={styles.uploadrow}>
          <img
            className={styles.img}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: headShape === 1 ? '50%' : '0'
            }}
            src={imgSrc}
            alt="头像"
          />
          <Upload
            className={styles.upload}
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
            <Button className={styles.btn} disabled={this.props.isReadOnly === 1}>上传头像</Button>
          </Upload>
        </div>
        <p className={styles.tips}>
          <span style={{ fontSize: '14px' }}>头像上传要求</span>
          <br />
          <span style={{ marginRight: '3em' }}>1. 建议使用正方形的图片</span>
          <span>2. 支持格式：jpg、png、jpeg</span>
        </p>
      </div>
    );
  }
}

Avatar.View = ({ value, headShape }) => (
  <img
    style={{
      width: '80px',
      height: '80px',
      borderRadius: headShape === 1 ? '100%' : '0'
    }}
    src={`/api/fileservice/read?fileid=${value}`}
    onError={(e) => { e.target.src = defaultAvatar; }} //eslint-disable-line
    alt=""
  />
);


export default connect(
  state => ({ token: state.app.token }),
  undefined,
  undefined,
  { withRef: true }
)(Avatar);
