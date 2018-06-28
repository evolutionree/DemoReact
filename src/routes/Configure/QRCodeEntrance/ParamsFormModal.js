/**
 * Created by 0291 on 2018/6/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select } from 'antd';
import CodeEditor from '../../../components/CodeEditor';

const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;

class ParamsFormModal extends Component {
  static propTypes = {
    form: PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, editingRecord } = nextProps;
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord
        });
      } else {
        form.resetFields();
      }
    }
  }


  onOk = () => {
    const { form, showModals, editingRecord } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      let {
        checktype,
        uscriptparam,
        ...checkparam
      } = values;
      const submitData = {
        checktype: checktype,
        checkparam: {
          ...checkparam,
          uscriptparam: {
            uscript: uscriptparam
          }
        }
      };

      console.log(submitData);
    });
  };

  render() {
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    const checktype = [{ value: 1, name: '字符串匹配' }, { value: 2, name: '正则表达式' },
      { value: 3, name: 'UScript' }, { value: 4, name: '实体查询' },
      { value: 5, name: '数据库脚本' }, { value: 6, name: '数据库函数' },
      { value: 7, name: '内部服务' }]
    return (
      <Modal
        visible={visible}
        title={'新增规则'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="匹配规则类型">
            {getFieldDecorator('checktype', { //1=字符串匹配，2=正则表达式，3是UScript，4=实体查询，5=数据库脚本6=数据库函数7=内部服务
              initialValue: '',
              rules: [{ required: true, message: '请选择匹配规则类型' }]
            })(
              <Select>
                {
                  checktype.map(item => {
                    return <Option value={item.value}>{item.name}</Option>;
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="规则说明">
            {getFieldDecorator('checkremark')(
              <TextArea />
            )}
          </FormItem>
          <FormItem label="U脚本">
            {getFieldDecorator('uscriptparam')(
              <CodeEditor />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, matchParams, modalPending } = state.qrcodeentrance;
    return {
      visible: /matchparams/.test(showModals),
      editingRecord: matchParams,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'qrcodeentrance/showModals', payload: '' });
      },
      add(data) {
        dispatch({ type: 'qrcodeentrance/add', payload: data });
      },
      edit(data) {
        dispatch({ type: 'qrcodeentrance/edit', payload: data });
      }
    };
  }
)(Form.create()(ParamsFormModal));
