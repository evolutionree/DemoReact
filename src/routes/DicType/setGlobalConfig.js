/**
 * Created by 0291 on 2018/6/7.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import DataTable from './DataTable';
import { saveDicType } from '../../services/dictionary';


class SetGlobalConfig extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      value: PropTypes.array,
      dataTableValue: this.props.globalConfig
    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataTableValue: nextProps.globalConfig
    });
  }

  dataTableChange = (value) => {
    this.setState({
      dataTableValue: value
    });
  }

  onOk = () => {
    saveDicType({
      dictypeid: '-1',
      dictypename: '全局配置',
      recstatus: 1,
      fieldconfig: JSON.stringify(this.state.dataTableValue),
      isconfig: 0
    }).then(result => {
      message.success('更新成功');
      this.props.cancel();
    }).catch(e => {
      console.error(e.message);
      message.error(e.message);
    });
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title="全局扩展配置"
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <DataTable onChange={this.dataTableChange} value={this.state.dataTableValue} />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, globalConfig } = state.dictype;
    return {
      visible: /setGlobalConfig/.test(showModals),
      globalConfig
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'dictype/showModals', payload: '' });
      }
    };
  }
)(SetGlobalConfig);
