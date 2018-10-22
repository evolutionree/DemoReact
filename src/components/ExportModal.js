/**
 * Created by 0291 on 2018/5/14.
 */
import React from 'react';
import { Modal, message, Form, Checkbox, Select, Spin } from 'antd';
import request from '../utils/request';
const CheckboxGroup = Checkbox.Group;

const FormItem = Form.Item;
const Option = Select.Option;

// const params = JSON.stringify({ ...queries, pageIndex: 1, pageSize: 65535 });
// window.open(`/api/excel/exportdata?TemplateType=1&DynamicQuery=${params}&UserId=${currentUser}`);
class ExportModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    entityId: React.PropTypes.string.isRequired,
    currentUser: React.PropTypes.number.isRequired,
    protocol: React.PropTypes.array.isRequired
  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  handleOk = () => {
    const { form, queries, currentUser, entityId } = this.props;
    const params = { ...queries, pageIndex: 1, pageSize: 655535 };
    form.validateFields((err, values) => {
      if (err) return;
      this.setState({
        loading: true
      })
      request('/api/excel/exportdata', {
        method: 'post', body: JSON.stringify({
          TemplateType: 1,
          DynamicQuery: JSON.stringify(params),
          UserId: currentUser,
          entityId,
          ...values
        })
      }).then(result => {
        this.setState({
          loading: false
        })
        this.closeModal();
        const fileid = result.data;
        window.open('api/ReportEngine/export2file?fileid=' + fileid, '_self');
      }).catch((e) => {
        this.setState({
          loading: false
        })
        console.error(e);
        message.error(e.message);
      });
    });
  };

  closeModal = () => {
    const { form, onCancel } = this.props;
    if (!this.state.loading) {
      form.resetFields();
      onCancel && onCancel();
    }
  }

  render() {
    const { visible, protocol, form: { getFieldDecorator, getFieldValue } } = this.props;
    const relTableField = protocol.filter(item => {
      return item.controltype === 24;
    }).map(item => {
      return {
        label: item.displayname,
        value: item.fieldname
      };
    });
    const formItemLayout = relTableField.length > 0 ? { labelCol: { span: 10 }, wrapperCol: { span: 14 } } : { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    return (
      <Modal
        title="导出配置"
        width={400}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.closeModal}
      >
        <Spin tip="数据正在处理中..." spinning={this.state.loading}>
          <Form>
            <FormItem
              {...formItemLayout}
              label="导出字段"
            >
              {getFieldDecorator('columnsource', {
                rules: [{
                  required: true, message: '请选择导出字段'
                }]
              })(
                <Select>
                  <Option value="0">按web列表设置字段</Option>
                  <Option value="1">按个人显示设置字段</Option>
                  <Option value="2">全部字段导出</Option>
                </Select>
              )}
            </FormItem>
            {
              relTableField.length > 0 ? <FormItem
                {...formItemLayout}
                label="需导出的分录"
              >
                {getFieldDecorator('nesttablelist')(
                  <CheckboxGroup options={relTableField} />
                )}
              </FormItem> : null
            }
            {
              getFieldValue('nesttablelist') && getFieldValue('nesttablelist') instanceof Array && getFieldValue('nesttablelist').length > 0 ? <FormItem
                {...formItemLayout}
                label="Excel数据处理方式"
              >
                {getFieldDecorator('rowmode', {
                  rules: [{
                    required: true, message: '请选择Excel数据处理方式'
                  }]
                })(
                  <Select>
                    <Option value="0">数据冗余显示</Option>
                    <Option value="1">去除重复拆分显示</Option>
                    <Option value="2">去除重复合并显示</Option>
                  </Select>
                )}
              </FormItem> : null
            }
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default ExportModal;
