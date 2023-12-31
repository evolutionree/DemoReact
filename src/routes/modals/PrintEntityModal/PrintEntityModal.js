import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Radio, message, Spin } from 'antd';
import { printEntity } from '../../../services/printTemplate';
import { downloadFile } from '../../../utils/ukUtil';

const tmpTypeConfig = {
  0: {
    name: 'Excel'
  },
  1: {
    name: 'Word'
  }
};

class PrintEntityModal extends Component {
  static propTypes = {
    currentStep: PropTypes.oneOf([0, 1]),
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    templateList: PropTypes.array,
    outputTypes: PropTypes.array
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      selectedTemplate: props.templateList.length ? props.templateList[0].recid : null,
      selectedTemplateType: props.templateList.length ? props.templateList[0].templatetype : 0,
      selectedOutput: props.outputTypes.length ? props.outputTypes[0].type : null,
      lodingPrint: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = this.props.currentStep === 0 && nextProps.currentStep === 1;
    const isClosing = this.props.currentStep === 1 && nextProps.currentStep === 0;
    if (isOpening) {
      this.setState({
        selectedTemplate: nextProps.templateList[0].recid,
        selectedTemplateType: nextProps.templateList[0].templatetype,
        selectedOutput: nextProps.outputTypes[0].type
      });
    }
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'printEntity/cancel'
    });
  };

  handleOk = () => {
    if (!this.state.selectedTemplate) {
      message.error('请选择模板');
      return;
    }
    if (!this.state.selectedOutput) {
      message.error('请选择方式');
      return;
    }
    const params = {
      entityid: this.props.entityId,
      recid: this.props.recordId,
      templateid: this.state.selectedTemplate,
      templatetype: this.state.selectedTemplateType
    };
    this.setState({
      lodingPrint: true
    });
    printEntity(params).then(result => {
      downloadFile(`api/PrintForm/exportfile?fileid=${result.data.fileid}&fileName=${result.data.filename}`);
      this.setState({
        lodingPrint: false
      });
      this.props.close && this.props.close();
    }, err => {
      this.setState({
        lodingPrint: false
      });
      message.error(err.message || '打印失败');
    });
  };

  render() {
    const { lodingPrint, selectedTemplate, selectedTemplateType, selectedOutput } = this.state;
    return (
      <Modal
        key={this.props.currentStep === 1 ? 'print' : new Date().getTime()}
        title="打印确认"
        visible={this.props.currentStep === 1}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <Spin spinning={lodingPrint}>
          <Form>
            <Form.Item label="可用模板">
              <Radio.Group value={selectedTemplate} onChange={e => this.setState({ selectedTemplate: e.target.value })}>
                {this.props.templateList.map(item => (
                  <Radio value={item.recid} key={item.recid}>{item.templatename}</Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item label="输出格式">
              <Radio.Group value={selectedTemplateType} onChange={e => this.setState({ selectedTemplateType: e.target.value })}>
                <Radio value={selectedTemplateType}>{tmpTypeConfig[selectedTemplateType].name}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="输出方式">
              <Radio.Group value={selectedOutput} onChange={e => this.setState({ selectedOutput: e.target.value })}>
                {this.props.outputTypes.map(item => (
                  <Radio value={item.type} key={item.type}>{item.label}</Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default connect(
  state => state.printEntity,
  dispatch => {
    return {
      close() {
        dispatch({ type: 'printEntity/cancel', payload: '' });
      },
      dispatch
    };
  }
)(PrintEntityModal);
