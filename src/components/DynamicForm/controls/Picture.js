import React, { PropTypes, Component } from 'react';
import { Upload, Icon, message } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import styles from './Picture.less';
import { getDeviceHeaders } from '../../../utils/request';
import { uploadImg } from '../../../utils/index';

class Picture extends Component {
  static propTypes = {
    isTable: PropTypes.bool,
    token: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    limit: PropTypes.number,
    isReadOnly: PropTypes.oneOf([0, 1]),
    pictureType: PropTypes.oneOf([0, 1]) // 0 支持拍照和选图片上传；1 只支持拍照上传
  };
  static defaultProps = {
    value: '',
    limit: 3
  };

  constructor(props) {
    super(props);
    this.state = {
      showRemove: false
    };
  }

  onPictureAdd = fileId => {
    const { value } = this.props;
    const newValue = value ? `${value},${fileId}` : fileId;
    this.props.onChange(newValue);
  };

  onPictureRemove = fileId => {
    const array = this.props.value.split(',');
    const newArray = array.filter(id => id !== fileId);
    const newValue = newArray.length ? newArray.join(',') : undefined;
    this.props.onChange(newValue);
  };

  togglePictureRemove = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        showRemove: !prevState.showRemove
      };
    });
  };

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  handleUploadChange = ({ file }) => {
    if (file.response && file.response.error_code === 0) {
      // 上传成功，拿uuid
      const fileId = file.response.data;
      this.onPictureAdd(fileId);
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

  // getPictureUrls = () => {
  //   const { value } = this.props;
  //   if (!value) return [];
  //   return value.split(',').map(fileId => `/api/fileservice/read?fileid=${fileId}`);
  // };

  render() {
    const { value, limit, isReadOnly, pictureType, isTable } = this.props;
    const { showRemove } = this.state;
    const fileIds = value ? value.split(',') : [];
    const showAdd = isReadOnly !== 1 && fileIds.length < limit;
    const showRemoveToggle = isReadOnly !== 1;
    return pictureType === 1
      ? <div>此控件只可在手机端显示</div>
      : (
        <div className={classnames({ [styles.wrap]: true, [styles.isTable]: isTable })}>
          {fileIds.map(fileId => (
            <span className={styles.holder} key={fileId}>
              <img src={`/api/fileservice/read?fileid=${fileId}&filetype=1`} alt="" />
              {showRemove && (
                <Icon
                  type="close-circle"
                  className={styles.remove}
                  onClick={() => { this.onPictureRemove(fileId); }}
                />
              )}
            </span>
          ))}
          {showAdd && <Upload
            className={styles.upload}
            name="data"
            // data={this.getUploadParams}
            showUploadList={false}
            action="/api/fileservice/upload"
            beforeUpload={this.beforeUpload}
            // onChange={this.handleUploadChange}
            headers={{
              ...getDeviceHeaders(),
              Authorization: 'Bearer ' + this.props.token
            }}
            customRequest={(e) => {
              uploadImg(e, (fileId) => {
                this.onPictureAdd(fileId);
              });
            }}
          >
            <span className={styles.holder} style={{ cursor: 'pointer' }}>
              <Icon type="plus" />
            </span>
          </Upload>}
          {showRemoveToggle && <span
            className={styles.holder}
            style={{ cursor: 'pointer' }}
            onClick={this.togglePictureRemove}
          >
            <Icon type="minus" />
          </span>}
        </div>
      );
  }
}

Picture.View = ({ value, dispatch }) => {
  const fileIds = value ? value.split(',') : [];
  const urls = fileIds.map(id => `/api/fileservice/read?fileid=${id}&filetype=1`);
  const originUrls = fileIds.map(id => `/api/fileservice/read?fileid=${id}`);
  return (
    <div>
      {urls.map(url => (
        <span className={styles.holder} key={url}>
          <img
            src={url}
            alt=""
            onClick={() => {
              dispatch({ type: 'app/viewImages', payload: originUrls.map(src => ({ src, active: src === url })) });
            }}
          />
        </span>
      ))}
    </div>
  );
};
Picture.View = connect()(Picture.View);

export default connect(
  state => ({ token: state.app.token }),
  undefined,
  undefined,
  { withRef: true }
)(Picture);
