import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Radio, message } from 'antd';
import _ from 'lodash';
import EntitySelect from '../../components/EntitySelect';
import CollectorRepeatSetting from './CollectorRepeatSetting';

const FormItem = Form.Item;

class CollectorFormModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      if (nextProps.isEdit) {
        const record = nextProps.editingRecord;
        const fieldsValue = _.pick(record, ['remindername', 'entityid', 'recstatus', 'remark']);
        const repeatsetting = _.pick(record, ['repeattype', 'cronstring']);
        if (repeatsetting.repeattype === undefined || repeatsetting.repeattype === null) {
          repeatsetting.repeattype = 0;
        }
        nextProps.form.setFieldsValue({
          ...fieldsValue,
          repeatsetting
        });
      } else {
        nextProps.form.resetFields();
      }
    }
  }

  repeatValidator = (rule, value, callback) => {
    if (value === undefined) {
      return callback('请设置执行时间');
    }
    setTimeout(() => {
      const msg = this.repeatSettingRef.validate();
      if (msg) return callback(msg);
      callback();
    }, 0);
  };

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      const params = {
        remindername: values.remindername,
        entityid: values.entityid,
        isrepeat: true,
        repeattype: values.repeatsetting.repeattype,
        cronstring: values.repeatsetting.cronstring,
        recstatus: values.recstatus,
        remark: values.remark,
        rectype: 1
      };
      if (this.props.isEdit) {
        params.reminderid = this.props.editingRecord.reminderid;
      }
      this.props.save(params);
    });
  };

  render() {
    const { visible, isEdit, cancel, form } = this.props;
    return (
      <Modal
        visible={visible}
        title={isEdit ? '编辑回收规则' : '新增回收规则'}
        onCancel={cancel}
        onOk={this.handleSubmit}
      >
        <Form>
          <FormItem label="回收规则名称">
            {form.getFieldDecorator('remindername', {
              rules: [
                { required: true, message: '请输入回收规则名称' },
                { max: 20, message: '最大长度为20个字符' }
              ]
            })(
              <Input placeholder="请输入回收规则名称" maxLength={20} />
            )}
          </FormItem>
          <FormItem label="关联实体">
            {form.getFieldDecorator('entityid', {
              rules: [{ required: true, message: '请选择关联实体' }]
            })(
              <EntitySelect placeholder="请选择关联实体" />
            )}
          </FormItem>
          <FormItem label="执行时间设置" required>
            {form.getFieldDecorator('repeatsetting', {
              validateTrigger: 'onChange',
              rules: [{ validator: this.repeatValidator }],
              initialValue: {
                repeattype: 0
              }
            })(
              <CollectorRepeatSetting ref={ref => this.repeatSettingRef = ref} />
            )}
          </FormItem>
          <FormItem label="是否启用">
            {form.getFieldDecorator('recstatus', {
              rules: [{ required: true, message: '请设置是否启用' }]
            })(
              <Radio.Group>
                <Radio value={1}>启用</Radio>
                <Radio value={0}>不启用</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label="备注信息">
            {form.getFieldDecorator('remark', {
              rules: [{ max: 200, message: '最大长度为200个字符' }]
            })(
              <Input type="textarea" placeholder="请输入备注信息" maxLength={200} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending } = state.collectorList;
    return {
      visible: /add|edit/.test(showModals),
      isEdit: /edit/.test(showModals),
      modalPending,
      editingRecord: currItems[0]
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'collectorList/showModals', payload: '' });
      },
      save(formData) {
        dispatch({ type: 'collectorList/save', payload: formData });
      }
    };
  }
)(Form.create()(CollectorFormModal));
