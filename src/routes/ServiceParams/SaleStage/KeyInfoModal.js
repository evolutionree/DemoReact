/**
 * Created by 0291 on 2017/7/26.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, Select, message, Radio } from 'antd';
import { connect } from 'dva';
import Transfer from './Transfer';


class KeyInfoModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    keyInfo: PropTypes.object
  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      keyInfo: this.props.keyInfo
    };
    this.handleOk = this.handleOk.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      keyInfo: nextProps.keyInfo
    })
  }
  handleOk() {
    const submitData = this.refs.transfer.getData();
    this.props.saveKeyInfo && this.props.saveKeyInfo(submitData);
  }

  render() {
    return (
      <Modal
        title="添加关键信息"
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.props.onCancel}>
        <Transfer ref='transfer' data={this.state.keyInfo} />
      </Modal>
    )
  }
}

export default connect(
  state => state.saleStage,
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'saleStageDetailSet/showModal', payload: '' });
      },
      saveKeyInfo(submitData) {
        dispatch({ type: 'saleStageDetailSet/saveKeyInfo', payload: submitData });
      }
    }
  }
)(KeyInfoModal);
