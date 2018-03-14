/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, Form, Spin, Input, Row, Col, Checkbox, Icon, Button, DatePicker } from 'antd';
import SelectBar from './SelectBar';
import { connect } from 'dva';
import Styles from './OtherDaySet.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

class OtherDaySet extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      visible: false
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

  }

  cancel = () => {
    this.setState({
      visible: false
    });
  }

  add = () => {
    this.setState({
      visible: true
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={Styles.Wrap}>
        <div>
          <span>添加必须打卡的日期</span>
          <Icon type="plus" onClick={this.add} />
        </div>
        <ul className={Styles.clearfix}>
          <li>
            <span>2018-01-01</span>
            <span style={{ paddingLeft: '10px' }}>A班次</span>
            <span className={Styles.operateWrap}>
              <Icon type="edit" onClick={this.add} />
              <Icon type="delete" />
            </span>
          </li>
          <li>
            <span>2018-01-01</span>
            <span style={{ paddingLeft: '10px' }}>A班次</span>
            <span className={Styles.operateWrap}>
              <Icon type="edit" onClick={this.add} />
              <Icon type="delete" />
            </span>
          </li>
          <li>
            <span>2018-01-01</span>
            <span style={{ paddingLeft: '10px' }}>A班次</span>
            <span className={Styles.operateWrap}>
              <Icon type="edit" onClick={this.add} />
              <Icon type="delete" />
            </span>
          </li>
        </ul>
        <Modal
          title="新增"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.cancel}
          style={{ top: 240 }}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="选择日期"
            >
              {getFieldDecorator('relateBusin', {
                initialValue: ''
              })(
                <DatePicker />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="选择班次"
            >
              {getFieldDecorator('relateBusin', {
                initialValue: ''
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const OtherDaySetForm = Form.create()(OtherDaySet);

export default OtherDaySetForm;
