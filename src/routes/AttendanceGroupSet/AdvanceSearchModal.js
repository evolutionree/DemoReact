import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button } from 'antd';
import { connect } from 'dva';
import { DynamicFormAdvanceSearch } from '../../components/DynamicForm';
import { getAdvanceSearchProtocol } from '../../services/entcomm';

class AdvanceSearchModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string,
    entityName: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      searchFields: [],
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      this.setState({ formData: {}, searchFields: [] });
    }

    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      if (!this.state.searchFields.length || this.props.entityId !== nextProps.entityId) {
        this.setState({ formData: {}, searchFields: [] }, this.fetchSearchFields);
      }
    } else if (isClosing) {
      this.setState({
        // formData: {},
        loading: false
      });
    }
  }

  fetchSearchFields = () => {
    this.setState({ loading: true });
    getAdvanceSearchProtocol(this.props.entityId).then(result => {
      this.setState({ loading: false });
      const searchFields = result.data;
      this.setState({
        // formData: generateDefaultFormData(searchFields),
        searchFields
      });
    }, error => {
      this.setState({ loading: false });
      message.error('获取搜索协议失败');
    });
  };

  handleOk = () => {
    const { formData, searchFields } = this.state;
    this.props.submit(DynamicFormAdvanceSearch.formatFormData(formData, searchFields));
  };

  clearForm = () => {
    this.setState({ formData: {} });
  };

  render() {
    const { visible, submit, entityId, cancel } = this.props;
    const { formData, searchFields, loading } = this.state;
    return (
      <Modal
        title="高级搜索"
        visible={visible}
        onOk={this.handleOk}
        onCancel={cancel}
      >
        <Spin spinning={loading}>
          <Button onClick={this.clearForm} type="default" style={{ marginBottom: '10px' }}>清空查询条件</Button>
          <DynamicFormAdvanceSearch
            entityId={entityId}
            value={formData}
            fields={searchFields}
            onChange={val => { this.setState({ formData: val }); }}
          />
        </Spin>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, entityId, entityName } = state.attendanceGroupSet;
    return {
      visible: /advanceSearch/.test(showModals),
      entityId,
      entityName
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'attendanceClassSet/showModals', payload: '' });
      },
      submit(formData) {
        dispatch({ type: 'attendanceClassSet/advanceSearch', payload: formData });
        dispatch({ type: 'attendanceClassSet/showModals', payload: '' });
      }
    };
  }
)(AdvanceSearchModal);
