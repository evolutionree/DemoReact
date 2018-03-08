/**
 * Created by 0291 on 2018/3/5.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button, Row, Col } from 'antd';
import AddForm from './AddForm';
import { connect } from 'dva';

class AddClassModal extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      FormValue: null
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {

    } else if (isClosing) {

    }
  }


  handleOk = () => {
    console.log(JSON.stringify(this.state.FormValue))
  };


  render() {
    const { visible, cancel } = this.props;
    return (
      <Modal
        title="考勤组设置"
        visible={visible}
        onOk={this.handleOk}
        onCancel={cancel}
      >
        <AddForm value={this.state.FormValue} onChange={(formValue) => { this.setState({ FormValue: formValue }) }} />
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals } = state.attendanceClassSet;
    return {
      visible: /add/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'attendanceClassSet/showModals', payload: '' });
      },
      submit(formData) {
        dispatch({ type: 'attendanceClassSet/showModals', payload: '' });
      }
    };
  }
)(AddClassModal);
