import React, { PropTypes, Component } from 'react';
import { Form, Modal, Input, message } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import { DynamicFormAdd, DynamicFormEdit, generateDefaultFormData } from '../../components/DynamicForm';
import { getGeneralProtocol, getEntcommDetail } from '../../services/entcomm';

const FormItem = Form.Item;

class SeriesFormModal extends Component {
  static propTypes = {
    currentItem: PropTypes.object,
    currentSeries: PropTypes.object,
    modalPending: PropTypes.bool,
    visible: PropTypes.bool,
    isEdit: PropTypes.bool,
    cancel: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired
  };
  static defaultProps = {
    currentSeries: {},
    modalPending: false,
    visible: false,
    isEdit: false
  };

  constructor(props) {
    super(props);
    this.state = {
      protocolFields: [],
      formData: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { currentSeries, isEdit, currentItem } = nextProps;
      if (isEdit) {
        Promise.all([
          this.fetchProtocol(true),
          this.fetchDetailData(currentItem.recid)
        ]).then(([protocolFields, detailData]) => {
          this.setState({
            protocolFields,
            formData: detailData
          });
        });
      } else {
        this.fetchProtocol().then(protocolFields => {
          this.setState({
            protocolFields,
            formData: generateDefaultFormData(protocolFields)
          });
        });
      }
    } else if (isClosing) {
      this.resetState();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.props.visible && !nextProps.visible) return false;
    return true;
  }

  resetState = () => {
    this.setState({
      protocolFields: [],
      formData: {}
    });
  };

  fetchProtocol = (isEdit) => {
    const params = {
      typeId: '59cf141c-4d74-44da-bca8-3ccf8582a1f2',
      OperateType: isEdit ? 1 : 0
    };
    return getGeneralProtocol(params).then(result => result.data);
  };

  fetchDetailData = recId => {
    const params = {
      entityId: '59cf141c-4d74-44da-bca8-3ccf8582a1f2',
      recId,
      NeedPower: 0
    };
    return getEntcommDetail(params).then(result => result.data.detail);
  };

  submitForm = () => {
    this.form.validateFields((err, values) => {
      if (err) return message.error('请检查表单');
      this.props.save(values);
    });
  };

  render() {
    const DynamicFormComponent = this.props.isEdit ? DynamicFormEdit : DynamicFormAdd;
    return (
      <Modal
        title="新增产品"
        visible={this.props.visible}
        onCancel={this.props.cancel}
        onOk={this.submitForm}
        confirmLoading={this.props.modalPending}
      >
        <DynamicFormComponent
          ref={form => this.form = form}
          entityId="59cf141c-4d74-44da-bca8-3ccf8582a1f2"
          fields={this.state.protocolFields}
          value={this.state.formData}
          onChange={formData => this.setState({ formData })}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, series, queries, modalPending, currentItems } = state.productManager;
    const currentSeries = _.find(series, ['productsetid', queries.productSeriesId]);
    return {
      currentSeries,
      modalPending,
      currentItem: currentItems[0],
      visible: /addProduct|editProduct/.test(showModals),
      isEdit: /editProduct/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'productManager/showModals', payload: '' });
      },
      save(data) {
        dispatch({ type: 'productManager/saveProduct', payload: data });
      }
    };
  }
)(SeriesFormModal);
