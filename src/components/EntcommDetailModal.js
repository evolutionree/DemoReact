import React, { PropTypes, Component } from 'react';
import { Modal, Spin } from 'antd';
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
      key: new Date().getTime(), // 每次打开弹窗时，都重新渲染
      loading: false
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
    this.setState({
      loading: true
    });
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
      this.setState({ protocol: result.data, loading: false });
    }).catch(e => {
      console.error(e.message)
      this.setState({
        loading: false
      });
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

    return (
      <Modal
        title={this.props.title || `${this.props.entityName || ''}详情`}
        visible={visible}
        onCancel={this.props.onCancel}
        onOk={this.props.onOk}
        footer={footer}
        width={document.body.clientWidth * 0.95}
        wrapClassName="DynamicFormModal"
        key={this.state.key}
      >
        <Spin spinning={this.state.loading}>
          <DynamicFormView
            entityId={entityId}
            entityTypeId={data.rectype || entityId}
            fields={protocol}
            value={data}
          />
        </Spin>
      </Modal>
    );
  }
}

export default EntcommDetailModal;
