/**
 * Created by 0291 on 2018/3/29.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, Form, Select } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};

class BindAttence extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.props.form.resetFields();
    }
  }

  onOk = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const groupObj = _.find(this.props.attenceGroupDataSource, item => item.id === values.groupid);
        this.props.bindAttence(groupObj);
      }
    });
  };

  render() {
    const { attenceGroupDataSource, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        title="绑定考勤组"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="选择考勤组"
          >
            {getFieldDecorator('groupid', {
              initialValue: '',
              rules: [{ required: true, message: '请选择考勤组' }]
            })(
              <Select>
                {
                  attenceGroupDataSource && attenceGroupDataSource instanceof Array && attenceGroupDataSource.map((item, index) => {
                    return <Option key={index} value={item.id}>{item.name}</Option>;
                  })
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const BindAttenceWrap = Form.create()(BindAttence);

export default connect(
  state => {
    const { currentItems, showModals, modalPending, attenceGroupDataSource } = state.structure;
    const user = currentItems[0];
    return {
      visible: /bindAttence/.test(showModals),
      user: user,
      modalPending,
      attenceGroupDataSource
    };
  },
  dispatch => {
    return {
      onCancel() {
        dispatch({ type: 'structure/showModals', payload: '' });
      },
      bindAttence(groupObj) {
        dispatch({ type: 'structure/bindAttence', payload: groupObj });
      }
    };
  }
)(BindAttenceWrap);
