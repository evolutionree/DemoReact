/**
 * Created by 0291 on 2018/7/23.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Select, Row, Col, Button, Upload, message } from 'antd';
import styles from './RelTableImportModal.less';
import { getDeviceHeaders } from '../../utils/request';


class RelTableImportModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    importUrl: PropTypes.string,
    cancel: PropTypes.func.isRequired,
    token: PropTypes.string,
    currentUser: PropTypes.number
  };

  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      operateType: 1,
      fileName: '',
      fileList: [],
      formData: {}, // 表单数据
      confirmLoading: false,
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染

      importData: [],
      pessionImport: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {

    } else if (isClosing) {
      this.resetState();
    }
  }

  getImportUrl = () => {
    return this.props.importUrl || '/api/excel/detailimport';
  };

  handleChange = (value) => {
    this.setState({
      operateType: value,
      fileName: '',
      fileList: [],
      importData: [],
      pessionImport: false
    });
  };

  onImpModalCancel = () => {
    this.props.cancel();
  };

  onImpModalConfirm = () => {
    const data = this.state.importData.map((item) => {
      return {
        TypeId: this.props.entityId,
        FieldData: item
      };
    });
    this.props.onOk && this.props.onOk(data, this.state.operateType);
  };

  getUploadParams = (file) => {
    const { mainEntityId, entityId } = this.props; //entityId 嵌套实体id  mainEntityId 简单实体或者 独立实体id
    return {
      MainEntityId: mainEntityId,
      MainRecId: null,
      MainTypeId: mainEntityId,
      DetailEntityId: entityId,
      MainDetail: null,
      DetailFieldsFilter: null,

      filename: file.name
    };
  };

  beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 3;
    if (!isLt100M) {
      message.error('文件大小不可超过3M!');
    }
    this.setState({
      fileName: ''
    });
    return isLt100M;
  };

  handleUploadChange = (info) => {
    let fileList = info.fileList;
    fileList = fileList.slice(-1);
    this.setState({
      fileList
    });
    if (info.file.status === 'removed') {
      return;
    }
    if (info.file.response && info.file.response.error_code !== 0) {
      this.setState({
        fileName: ''
      });
      message.error(info.file.response.error_msg);
    } else if (info.file.response && info.file.response.error_code === 0) {
      // 上传成功
      const { data } = info.file.response;
      this.setState({
        fileName: info.file.name,
        importData: data,
        pessionImport: true
      });
    }
  };

  resetState = () => {
    this.setState({
      formData: {}, // 表单数据
      confirmLoading: false,
      operateType: 1,
      fileName: '',
      fileList: [],
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染

      importData: [],
      pessionImport: false
    });
  };

  render() {
    return (
      <div key={this.state.key}>
        <Modal title="导入"
               width={589}
               visible={this.props.visible}
               onCancel={this.onImpModalCancel}
               footer={[
                 <Button key="back" onClick={this.onImpModalCancel}>关    闭</Button>,
                 <Button key="submit" disabled={!this.state.pessionImport} onClick={this.onImpModalConfirm}>开始导入</Button>
               ]}
        >
          <div className={styles.importMain}>
            <Row className={styles.row}>
              <Col span={2} className={styles.col_icon}>1</Col>
              <Col span={16} className={styles.col_context}>当数据重复时的操作方式：</Col>
              <Col span={6}>
                <Select defaultValue="1" className={styles.col_selectButton} onChange={this.handleChange}>
                  <Select.Option key="1">追加导入</Select.Option>
                  <Select.Option key="2">覆盖导入</Select.Option>
                </Select>
              </Col>
            </Row>
            <Row className={styles.row}>
              <Upload
                className={styles.uploadButton}
                name="data"
                data={this.getUploadParams}
                showUploadList
                fileList={this.state.fileList}
                action={this.getImportUrl()}
                beforeUpload={this.beforeUpload}
                onChange={this.handleUploadChange}
                headers={{
                  ...getDeviceHeaders(),
                  Authorization: 'Bearer ' + this.props.token
                }}
              >
                <Col span={2} className={styles.col_icon}>2</Col>
                <Col span={16} className={styles.col_context}>选择已填写好的Excel文件</Col>
                <Button className={styles.col_fileButton}>选择文件</Button>
              </Upload>
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}


export default connect(
  state => {
    return {
      token: state.app.token,
      currentUser: state.app.user.userid
    };
  },
  dispatch => {
    return {
    };
  }
)(RelTableImportModal);
