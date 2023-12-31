/**
 * Created by 0291 on 2018/6/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, message, Button, Tooltip, Icon } from 'antd';
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
      childModalVisible: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, editingRecord } = nextProps;
      const { getFieldsValue, setFieldsValue } = form;
      if (editingRecord) {
        const keys = getFieldsValue();
        const result = {};

        for (const key in keys) {
          if (editingRecord[key] !== undefined) {
            result[key] = (editingRecord[key] + '') || '';
          }
        }
        
        setFieldsValue(result);
      }
    }
  }

  checkTypeChange = (value) => {
    const { form: { setFieldsValue } } = this.props;
    if (value !== '3') {
      message.warning('目前只支持编辑【UScript】类型的匹配规则');
      setTimeout(() => {
        setFieldsValue({ checktype: '3' });
      }, 100);
    }
  }

  openChildModal = () => {
    this.setState({
      childModalVisible: true
    });
  }

  closeChildModal = () => {
    this.setState({
      childModalVisible: false
    });
  }

  submitTest = () => {
    this.setState({
      showTest: true
    });
  }

  onOk = () => {
    const { form, editingRecord, update } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      const {
        checktype,
        uscriptparam,
        checkremark,
        ...checkparam
      } = values;
      const submitData = {
        recid: editingRecord.recid,
        checktype: checktype,
        checkremark,
        checkparam: {
          ...checkparam,
          uscriptparam: {
            uscript: uscriptparam
          }
        }
      };

      update && update(submitData);
    });
  };

  onCancel = (e) => {
    const { form: { resetFields }, cancel } = this.props;
    resetFields();
    cancel(e);
  }

  render() {
    const { visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    const checktype = [
      { value: '1', name: '字符串匹配' },
      { value: '2', name: '正则表达式' },
      { value: '3', name: 'UScript' },
      { value: '4', name: '实体查询' },
      { value: '5', name: '数据库脚本' },
      { value: '6', name: '数据库函数' },
      { value: '7', name: '内部服务' }
    ];

    return (
      <Modal
        visible={visible}
        title={'更新匹配参数'}
        onCancel={this.onCancel}
        footer={[
          <Button key="0" onClick={this.onCancel}>取消</Button>,
          <Button key="1" onClick={this.openChildModal} disabled>测试</Button>,
          <Button key="2" onClick={this.onOk}>保存</Button>
        ]}
      >
        <Form>
          <FormItem label="匹配规则类型">
            {getFieldDecorator('checktype', { // 1=字符串匹配，2=正则表达式，3是UScript，4=实体查询，5=数据库脚本6=数据库函数7=内部服务
              initialValue: '3',
              rules: [{ required: true, message: '请选择匹配规则类型' }]
            })(
              <Select onChange={this.checkTypeChange}>
                {
                  checktype.map(item => {
                    return <Option key={item.value} value={item.value}>{item.name}</Option>;
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
          <FormItem label={
            <span>
              U脚本
              <Tooltip placement="top" title={<div>
                <p>UScript引擎会传入"ukservice"对象，根据这个对象可以访问数据库（详见UScript服务端API）。同时传入“JsParam”对象，对象中包含ScanCode,和ScanCodeType两个字段（注意区分大小写）。</p>
                <p>其他注意事项：</p>
                <ul>
                  <li>1、UScript中所有整数类型将被转换为double型，使用时建议采用string（字符串)</li>
                  <li>2、必须有return语句，且必须为布尔类型(true/false)</li>
                </ul>
              </div>}>
                <Icon type="info-circle" style={{ fontSize: '16px', marginLeft: '4px', color: '#797979' }} />
              </Tooltip>
            </span>
          }>
            {getFieldDecorator('uscriptparam')(
              <CodeEditor style={{ border: '1px solid #ddd' }} />
            )}
          </FormItem>
        </Form>
        <Modal
          visible={this.state.childModalVisible}
          onCancel={this.closeChildModal}
          footer={null}
        >
          <div style={{ margin: '30px 0 15px' }}>
            <span>测试字符串：</span>
            <Input style={{ width: 400 }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Button onClick={this.submitTest}>提交测试</Button>
          </div>
          <div style={{ display: this.state.showTest ? 'block' : 'none' }}>
            测试字符串
            测试结果匹配/不匹配/执行异常
            失败日志XXXXXX不成功
            执行耗时300毫秒
          </div>
        </Modal>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, matchParams } = state.qrcodeentrance;
    return {
      visible: /matchparams/.test(showModals),
      editingRecord: matchParams
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'qrcodeentrance/showModals', payload: '' });
      },
      update(data) {
        dispatch({ type: 'qrcodeentrance/updatematchparams', payload: data });
      }
    };
  }
)(Form.create()(ParamsFormModal));
