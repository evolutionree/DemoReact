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

  };


  render() {
    const { visible, cancel } = this.props;
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return (
      <Modal
        title="新增"
        visible={visible}
        onOk={this.handleOk}
        onCancel={cancel}
      >
        <AddForm value={this.state.FormValue} onChange={(formValue) => { this.setState({ FormValue: formValue }) }} />
        <div>
          <div>
            <Row>
              <Col span={6}>工作日</Col>
              <Col span={12}>班次</Col>
              <Col span={6}>操作</Col>
            </Row>
          </div>
          <ul>
            {
              days.map((item, index) => {
                return (
                  <li>
                    <Row>
                      <Col span={6}>{item}</Col>
                      <Col span={12}>A班次</Col>
                      <Col span={6}>更改班次</Col>
                    </Row>
                  </li>
                );
              })
            }
          </ul>
        </div>

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
