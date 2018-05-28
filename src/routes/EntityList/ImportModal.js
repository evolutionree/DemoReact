/**
 * Created by 0291 on 2018/5/28.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Icon, Upload, Row, Col, message } from 'antd';
import { getDeviceHeaders } from '../../utils/request';
import axios from 'axios';

class ImportModal extends Component {
  static propTypes = {
    modalVisible: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      uploading: false,
      showErr: ''
    };
  }

  cancel = () => {
    this.setState({
      fileList: [],
      showErr: ''
    });
    this.props.cancel();
  }

  beforeUpload = (file, fileList) => {
    this.setState({
      fileList: fileList
    });
    return false;
  };

  onRemove = (file) => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList
      };
    });
  }

  handleUpload = () => {
    this.setState({
      uploading: true
    })
    const { fileList } = this.state;
    if (fileList instanceof Array && fileList.length === 0) {
      message.error('请先选择文件，再执行导入操作');
      return;
    }
    const formData = new FormData();
    formData.append('data', fileList[0]);

    // let config = {
    //   ...getDeviceHeaders(),
    //   Authorization: 'Bearer ' + this.props.token,
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // }
    // axios.post('/api/EntityPro/importentity', formData, config).then(res => {
    //   console.log(res);
    // }).catch( res => {
    //   console.log(res);
    // })

    let xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
    xhr.open('post', '/api/EntityPro/importentity', true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
    xhr.onload = ({ currentTarget }) => {
      const response = JSON.parse(currentTarget.response);
      if (response && response.error_code === 0) {
        // 上传成功，拿uuid
        const { result, allmessage } = response.data;
        if (result === 0) {
          message.success('导入成功');
          this.cancel();
        } else {
          this.setState({
            showErr: allmessage
          });
        }

        this.setState({
          uploading: false
        });
      } else {
        this.setState({
          uploading: false
        });
        message.error(response.error_msg);
        console.error(response.error_msg);
      }
    }; //请求完成
    xhr.onerror = (e) => {
      console.error(e.message);
      message.error(e.message);
      this.setState({
        uploading: false
      });
    }; //请求失败
    const headers = {
      ...getDeviceHeaders(),
      Authorization: 'Bearer ' + this.props.token
    };
    for (let item in headers) {
      xhr.setRequestHeader(item, headers[item]);
    }
    xhr.send(formData); //开始上传，发送form数据
  }

  render() {
    const { modalVisible } = this.props;

    return (
      <Modal
        wrapClassName="entityImport"
        title="实体导入"
        visible={modalVisible}
        onCancel={this.cancel}
        onOk={this.handleUpload}
        cancelText="关    闭"
        okText="开始导入"
        confirmLoading={this.state.uploading}
      >
        <Upload
          name="data"
          showUploadList
          fileList={this.state.fileList}
          beforeUpload={this.beforeUpload}
          onRemove={this.onRemove}
        >
          <Button>选择文件</Button>
        </Upload>
        {
          this.state.showErr ? (
            <div style={{
              marginTop: '20px',
              paddingTop: '4px',
              borderTop: '1px solid #e3e1e1',
              color: '#e56b6b'
            }}>
              <h3> 错误信息：</h3>
              {
                this.state.showErr
              }
            </div>
          ) : null
        }
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals } = state.entityList;
    return {
      modalVisible: /import/.test(showModals),
      token: state.app.token
    };
  },
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'entityList/showModals', payload: '' });
      },
      submit: data => {

      }
    };
  }
)(ImportModal);
