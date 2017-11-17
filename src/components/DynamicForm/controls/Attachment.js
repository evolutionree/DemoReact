import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Icon, Upload, Button, message } from 'antd';
import _ from 'lodash';
import { getDeviceHeaders } from '../../../utils/request';
import { formatFileSize } from '../../../utils';
import styles from './Attachment.less';

const parseValue = (value) => {
  if (!value) return [];

  if (typeof value === 'string') {
    let files = [];
    try {
      files = JSON.parse(value);
      return files;
    } catch (e) {
      console.error('附件value格式出错');
      return files;
    }
  } else {
    return value;
  }
};

class Attachment_ extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string, // json字符串
      PropTypes.arrayOf(PropTypes.shape({
        fileid: PropTypes.string,
        filename: PropTypes.string,
        filelength: PropTypes.number
      }))
    ]),
    onChange: PropTypes.func.isRequired,
    limit: PropTypes.number,
    isReadOnly: PropTypes.oneOf([0, 1])
  };
  static defaultProps = {
    limit: 3
  };

  constructor(props) {
    super(props);
    this.state = {
      uploadingFiles: []
    };
  }

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  handleUploadChange = ({ file, fileList }) => {
    const completedFiles = parseValue(this.props.value);
    if (file.response && file.response.error_code === 0) {
      // 上传成功，拿uuid
      const fileId = file.response.data;
      const newCompletedFile = {
        fileid: fileId,
        filename: file.name,
        filelength: file.size
      };
      const newValue = [...completedFiles, newCompletedFile];
      this.props.onChange(newValue);
    } else if (file.response && file.response.error_code) {
      message.error(file.response.error_msg);
    }
    const uploadingFiles = fileList.filter(item => item.status !== 'done');
    this.setState({ uploadingFiles });
  };

  handleRemove = file => {
    const completedFiles = parseValue(this.props.value);
    const { uploadingFiles } = this.state;
    const { uid } = file;

    if (_.find(completedFiles, ['fileid', uid])) {
      this.props.onChange(completedFiles.filter(item => item.fileid !== uid));
    } else if (_.find(uploadingFiles, ['fileid', uid])) {
      this.setState({
        uploadingFiles: uploadingFiles.filter(item => item.uid !== uid)
      });
    }
  };

  beforeUpload = file => {
    const { limit } = this.props;
    if (parseValue(this.props.value).length > limit) {
      message.error(`附件个数最多为${limit}个`);
      return false;
    }

    if (file.size > 1024 * 1024 * 100) {
      message.error('文件大小不可超过100M');
      return false;
    }
    return true;
  };

  getFileList = () => {
    const files = parseValue(this.props.value);
    let completedFileList = [];
    if (files) {
      completedFileList = files.map(file => {
        return {
          uid: file.fileid,
          name: file.filename,
          status: 'done',
          url: `/api/fileservice/download?fileid=${file.fileid}`
        };
      });
    }
    const fileList = [...completedFileList, ...this.state.uploadingFiles];
    return fileList;
  };

  render() {
    const fileList = this.getFileList();
    const readOnly = this.props.isReadOnly === 1;
    const overLimit = fileList.length >= this.props.limit;
    return (
      <div className={styles.wrap}>
        <Upload
          name="data"
          action="/api/fileservice/upload"
          data={this.getUploadParams}
          fileList={fileList}
          beforeUpload={this.beforeUpload}
          onChange={this.handleUploadChange}
          onRemove={this.handleRemove}
          headers={{
            ...getDeviceHeaders(),
            Authorization: 'Bearer ' + this.props.token
          }}
          disabled={readOnly || overLimit}
        >
          <Button
            type="default"
            size="default"
            disabled={readOnly}
            onClick={() => {
              if (overLimit) { message.error(`附件个数最多为${this.props.limit}个`); }
            }}
          >
            <Icon type="upload" /> 上传文件
          </Button>
        </Upload>
      </div>
    );
  }
}

const Attachment = connect(state => ({ token: state.app.token }))(Attachment_);

Attachment.View = ({ value }) => {
  const files = parseValue(value);
  return (
    <div className={styles.wrap}>
      {files.length ? <ul>
        {files.map(file => (
          <li key={file.fileid}>
            <a href={`/api/fileservice/download?fileid=${file.fileid}`}>
              <Icon type="download" className={styles.icon} />
              {file.filename}
            </a>
          </li>
        ))}
      </ul> : <span style={{ color: '#999999' }}>(空)</span> }
    </div>
  );
};

export default Attachment;
