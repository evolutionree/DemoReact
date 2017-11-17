import React, { PropTypes, Component } from 'react';
import { Modal, Select } from 'antd';
import { DynamicFormView } from './DynamicForm';
import { getGeneralProtocol, getEntcommDetail } from '../services/entcomm';

class EntcommDetailModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func,
    footer: PropTypes.arrayOf(PropTypes.node),
    title: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      protocol: [], // 协议字段
      data: {}, // 表单数据
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { entityId, recordId } = nextProps;
      this.fetchDetailAndProtocol(entityId, recordId);
    } else if (isClosing) {
      this.resetState();
    }
  }

  fetchDetailAndProtocol = (entityId, recordId) => {
    getEntcommDetail({
      entityId,
      recId: recordId,
      needPower: 0 // TODO 跑权限
    }).then(result => {
      let { detail } = result.data;
      if (detail instanceof Array) {
        detail = detail[0];
      }
      this.setState({ data: detail });
      return getGeneralProtocol({
        typeId: detail.rectype || entityId,
        OperateType: 2
      });
    }).then(result => {
      this.setState({ protocol: result.data });
    });
  };

  resetState = () => {
    this.setState({
      protocol: [],
      data: {},
      key: new Date().getTime()
    });
  };

  render() {
    const { visible, footer, entityId } = this.props;
    const { protocol, data } = this.state;

    const hasTable = protocol.some(field => {
      return field.controltype === 24 && (field.fieldconfig.isVisible === 1);
    });

    return (
      <Modal
        title={this.props.title || `${this.props.entityName || ''}详情`}
        visible={visible}
        onCancel={this.props.onCancel}
        onOk={this.props.onOk}
        footer={footer}
        width={hasTable ? 900 : 550}
        key={this.state.key}
      >
        <DynamicFormView
          entityTypeId={data.rectype || entityId}
          fields={protocol}
          value={data}
        />
      </Modal>
    );
  }
}

export default EntcommDetailModal;
