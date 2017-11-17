/**
 * Created by 0291 on 2017/11/1.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button } from 'antd';
import { connect } from 'dva';
import { DynamicFormAdvanceSearch } from '../../../../components/DynamicForm';
import { getAdvanceSearchProtocol } from '../../../../services/entcomm';

class AdvanceSearchModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    entityId: PropTypes.string
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

  componentWillMount() {
    console.log('componentWillMount');
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    console.log(this.props.entityId)
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
    const { visible, submit, cancel } = this.props;
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
    const { showModals } = state.daily;
    return {
      visible: /advanceSearch/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'daily/showModals', payload: '' });
      },
      submit(formData) {
        dispatch({ type: 'daily/changeAllDailySearchData', payload: formData });
        dispatch({ type: 'daily/showModals', payload: '' });
        dispatch({ type: 'daily/updataTable', payload: { } });
      }
    };
  }
)(AdvanceSearchModal);
