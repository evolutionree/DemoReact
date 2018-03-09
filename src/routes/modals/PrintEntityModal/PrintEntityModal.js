import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Radio, message } from 'antd';
import { printEntity } from '../../../services/printTemplate';

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
      selectedTemplate: null,
      selectedOutput: null
    };
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
      templateid: this.state.selectedTemplate
    };
    printEntity(params).then(result => {
      window.open(`api/PrintForm/exportfile?fileid=${result.data.fileid}&fileName=${result.data.filename}`);
    }, err => {
      message.error(err.message || '打印失败');
    });
  };

  render() {
    return (
      <Modal
        title="打印确认"
        visible={this.props.currentStep === 1}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <Form>
          <Form.Item label="可用模板">
            <Radio.Group value={this.state.selectedTemplate} onChange={e => this.setState({ selectedTemplate: e.target.value })}>
              {this.props.templateList.map(item => (
                <Radio value={item.recid} key={item.recid}>{item.templatename}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="输出方式">
            <Radio.Group value={this.state.selectedOutput} onChange={e => this.setState({ selectedOutput: e.target.value })}>
              {this.props.outputTypes.map(item => (
                <Radio value={item.type} key={item.type}>{item.label}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => state.printEntity
)(PrintEntityModal);
