import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Select, Row, Col, Button, Upload, message, Option } from 'antd';
import styles from './ImportModal.less';
import { getDeviceHeaders } from '../../../utils/request';
import {downloadFile} from "../../../utils/ukUtil";


class ImportModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    templateType: PropTypes.oneOf([0, 1]), // 0固定模板，1动态模板
    templateKey: PropTypes.string, // 固定模板时为FuncName，动态模板时为entityid
    importUrl: PropTypes.string,
    importTemplate: PropTypes.string,
    cancel: PropTypes.func.isRequired,
    token: PropTypes.string,
    explainInfo: PropTypes.array,
    showOperatorType: PropTypes.bool,
    currentUser: PropTypes.number
  };

  static defaultProps = {
    explainInfo: [
      '模版中的表头名称不可更改，表头行不能删除',
      '导入文件大小请勿超过 2 MB',
      '红色列表头为必填字段',
      '其他选填字段，如填写了，数据也要正确，否则导入会失败',
      '行政区域，输入省、市或者省市区，都可以',
      '所属行业、客户规模、客户级别，必须为系统在库的数据，可在“字典配置》字典参数”设置中查看',
      '日期格式为 YYYY/MM/DD,如 2015/8/8',
      '字段格式为多选框的，多个值之间用“,”隔开'
    ]
  };

  constructor(props) {
    super(props);
    this.state = {
      operateType: 4,
      fileName: '',
      taskId: '',
      fileList: [],
      formData: {}, // 表单数据
      confirmLoading: false,
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
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
    return this.props.importUrl || '/api/excel/importdata';
  };

  getImportTemplateUrl = () => {
    const { templateType, templateKey, importTemplate, currentUser } = this.props;
    if (importTemplate) {
      return importTemplate;
    }
    return templateType === 0
      ? `/api/excel/exporttemplate?templateType=0&exportType=1&key=${templateKey}&UserId=${currentUser}`
      : `/api/excel/exporttemplate?templateType=1&key=${templateKey}&UserId=${currentUser}`;
  };

  downTemplate = () => {
    downloadFile(this.getImportTemplateUrl());
  }

  handleChange = (value) => {
    this.setState({
      operateType: value,
      fileName: '',
      taskId: '',
      fileList: []
    });
  };

  onImpModalCancel = () => {
    this.props.cancel();
  };

  onImpModalConfirm = () => {
    const taskId = this.state.taskId;
    if (taskId) {
      this.props.taskStart(taskId);
      const arrayTask = {
        taskId: this.state.taskId,
        fileName: this.state.fileName
      };
      this.props.addTask(arrayTask);
      this.props.done();
    } else {
      message.error('请先上传文件格式正确的文件!');
    }
  };

  getUploadParams = (file) => {
    return {
      key: this.props.templateKey,
      templatetype: this.props.templateType,
      operatetype: this.state.operateType,
      filename: file.name
    };
  };

  beforeUpload = file => {
    const isLt100M = file.size / 1024 / 1024 < 3;
    if (!isLt100M) {
      message.error('文件大小不可超过3M!');
    }
    this.setState({
      fileName: '',
      taskId: ''
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
        fileName: '',
        taskId: ''
      });
      message.error(info.file.response.error_msg);
    } else if (info.file.response && info.file.response.error_code === 0) {
      // 上传成功，拿uuid
      const { taskid } = info.file.response.data;
      if (taskid) {
        this.setState({
          fileName: info.file.name,
          taskId: taskid
        });
      }
    }
  };

  resetState = () => {
    this.setState({
      formData: {}, // 表单数据
      confirmLoading: false,
      operateType: 4,
      fileName: '',
      taskId: '',
      fileList: [],
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    });
  };

  render() {
    return (
      <div key={this.state.key}>
        <Modal title="导入"
               width={589}
               visible={this.props.visible}
               onCancel={this.onImpModalCancel}
               onOk={this.onImpModalConfirm}
               cancelText="关    闭"
               okText="开始导入"
        >
          <div className={styles.importMain}>
            <Row className={styles.row}>
              <Col span={2} className={styles.col_icon}>1</Col>
              <Col span={16} className={styles.col_context}>请按照Excel数据模版格式准备数据</Col>
              <Col span={6}>
                <Button className={styles.col_downButton} onClick={this.downTemplate}>下载模版</Button>
              </Col>
            </Row>
            {this.props.showOperatorType && <Row className={styles.row}>
              <Col span={2} className={styles.col_icon}>2</Col>
              <Col span={16} className={styles.col_context}>当数据重复时的操作方式：</Col>
              <Col span={6}>
                <Select defaultValue="4" className={styles.col_selectButton} onChange={this.handleChange}>
                  <Select.Option value="4">放弃导入</Select.Option>
                  <Select.Option value="5">覆盖导入</Select.Option>
                </Select>
              </Col>
            </Row>}
            <Row className={styles.row}>
              <Upload
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
                <Col span={2} className={styles.col_icon}>{this.props.showOperatorType ? '3' : '2'}</Col>
                <Col span={16} className={styles.col_context}>选择已填写好的Excel文件</Col>
                <Button className={styles.col_fileButton}>选择文件</Button>
              </Upload>
            </Row>
          </div>
          <div className={styles.noticeMain}>
            <Row className={styles.title}>
              <Col>注意事项：</Col>
            </Row>
            {
              this.props.explainInfo.map((item, index) => {
                return (
                  <Row className={styles.row} key={'explain' + index}>
                    <Col>{(index + 1) + '.' + item}</Col>
                  </Row>
                );
              })
            }
          </div>
        </Modal>
      </div>
    );
  }
}


export default connect(
  state => {
    const { showModals, templateType, templateKey, importUrl, importTemplate, explainInfo, showOperatorType } = state.task;
    return {
      visible: /import/.test(showModals),
      templateType,
      templateKey,
      importUrl,
      importTemplate,
      explainInfo,
      showOperatorType,
      token: state.app.token,
      currentUser: state.app.user.userid
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({
          type: 'task/showModals',
          payload: ''
        });
      },
      addTask(arrayTask) {
        dispatch({
          type: 'task/addTask',
          payload: arrayTask
        });
      },
      taskStart(taskId) {
        dispatch({
          type: 'task/taskStart',
          payload: taskId
        });
        dispatch({
          type: 'task/selectTask',
          payload: { taskid: taskId }
        });
        dispatch({
          type: 'task/showModals',
          payload: 'impProgross'
        });
      },
      done() {
        // dispatch({
        //   type: 'task/showModals'
        // });
      }
    };
  }
)(ImportModal);
