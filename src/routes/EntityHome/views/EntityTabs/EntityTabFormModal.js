import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Form, message, Input, Select, Checkbox, Modal } from 'antd';
import * as _ from 'lodash';
import { getrelentityfields } from '../../../../services/entity';
import SelectAppIcon from '../../../../components/SelectAppIcon';

const FormItem = Form.Item;
const Option = Select.Option;

class EntityTabFormModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    save: PropTypes.func,
    cancel: PropTypes.func,
    currentItem: PropTypes.object,
    isEdit: PropTypes.bool,
    entityId: PropTypes.string,
    modalPending: PropTypes.bool,
    form: PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entityFields: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { isEdit, currentItem, form, entityId } = nextProps;
      if (isEdit) {
        const formValues = _.pick(currentItem, ['relname', 'relentityid', 'fieldid', 'ismanytomany', 'srctitle', 'srcsql', 'icon']);
        formValues.ismanytomany = !!formValues.ismanytomany;
        form.setFieldsValue(formValues);
        this.fetchEntityFields(entityId, formValues.relentityid);
      } else {
        form.resetFields();
      }
    } else if (isClosing) {
      this.setState({ entityFields: [] });
    }
  }

  fetchEntityFields = (entityId, relEntityId) => {
    if (!relEntityId) {
      this.setState({ entityFields: [] });
      return;
    }
    getrelentityfields(this.props.entityId, relEntityId).then(result => {
      this.setState({ entityFields: result.data });
    }, err => {
      message.error('加载实体字段失败');
    });
  };

  onEntityChange = (value) => {
    this.props.form.setFieldsValue({ fieldid: undefined });
    this.fetchEntityFields(this.props.entityId, value);
  };

  handleSubmit = () => {
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
      const saveData = {
        ...values,
        ismanytomany: values.ismanytomany ? 1 : 0
      };
      if (!saveData.fieldid) {
        delete saveData.fieldid;
        delete saveData.relentityid;
      }
/*      if (this.props.isEdit && this.props.currentItem.entitytaburl) {
        saveData.icon = this.props.currentItem.icon;
      } else {
        const matchField = _.find(this.state.entityFields, ['fieldid', values.fieldid]);
        saveData.icon = matchField ? matchField.icons : '';
      }*/
      this.props.save(saveData);
    });
  };

  render() {
    const { visible, currentItem, form, isEdit, cancel, modalPending } = this.props;
    const isEntityTab = !(currentItem && currentItem.entitytaburl);
    const showDataSrcFields = isEntityTab && form.getFieldValue('ismanytomany');
    return (
      <Modal
        width={640}
        maskClosable={false}
        title={isEdit ? '编辑页签' : '新增页签'}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={cancel}
        confirmLoading={modalPending}
      >
        <Form>
          <FormItem label="页签名称">
            {form.getFieldDecorator('relname', {
              rules: [{ required: true, message: '请输入页签名称' }]
            })(
              <Input placeholder="请输入页签名称" />
            )}
          </FormItem>
          {<FormItem label="关联实体" style={isEntityTab ? null : { display: 'none' }}>
            {form.getFieldDecorator('relentityid', {
              rules: [{ required: isEntityTab, message: '请选择关联实体' }]
            })(
              <Select onChange={this.onEntityChange}>
                {this.props.entityList.map(t => (
                  <Option value={t.entityid} key={t.entityid}>{t.entityname}</Option>
                ))}
              </Select>
            )}
          </FormItem>}
          {<FormItem label="关联字段" style={isEntityTab ? null : { display: 'none' }}>
            {form.getFieldDecorator('fieldid', {
              rules: [{ required: isEntityTab, message: '请选择关联字段' }]
            })(
              <Select>
                {this.state.entityFields.map(t => (
                  <Option key={t.fieldid}>{t.datasrcname}</Option>
                ))}
              </Select>
            )}
          </FormItem>}
          {<FormItem style={isEntityTab ? null : { display: 'none' }}>
            {form.getFieldDecorator('ismanytomany', {
              valuePropName: 'checked'
            })(
              <Checkbox>新增时是否引用数据</Checkbox>
            )}
          </FormItem>}
          <FormItem label="数据源标题" style={showDataSrcFields ? null : { display: 'none' }}>
            {form.getFieldDecorator('srctitle', {
              rules: [{ required: showDataSrcFields, message: '请输入数据源标题' }]
            })(
              <Input placeholder="请输入数据源标题" maxLength = "50" />
            )}
          </FormItem>
          <FormItem label="数据脚本" style={showDataSrcFields ? null : { display: 'none' }}>
            {form.getFieldDecorator('srcsql', {
              rules: [{ required: showDataSrcFields, message: '请输入数据脚本' } ]
            })(
              <Input.TextArea rows={10} placeholder="请输入数据脚本" maxLength="2000" />
            )}
          </FormItem>
          <FormItem label="请选择图标">
            {form.getFieldDecorator('icon', {
              initialValue: '',
              rules: [{ required: true, message: '请选择图标' }]
            })(
              <SelectAppIcon usage="4" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { entityTabs } = state;
    const { showModals, currentItem, entityList, entityId, modalPending } = entityTabs;
    return {
      visible: /add|edit/.test(showModals),
      isEdit: /edit/.test(showModals),
      currentItem,
      entityList,
      entityId,
      modalPending
    };
  },
  dispatch => {
    return {
      save(formValues) {
        dispatch({ type: 'entityTabs/save', payload: formValues });
      },
      cancel() {
        dispatch({ type: 'entityTabs/showModals', payload: '' });
      }
    };
  }
)(Form.create()(EntityTabFormModal));

