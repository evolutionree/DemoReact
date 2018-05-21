/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, Radio, Checkbox, InputNumber, message } from 'antd';
import RelTable from './RelTable';
import { query as queryEntities } from '../../../services/entity';

const FormItem = Form.Item;
const Option = Select.Option;

class SchemeFormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    editingRecord: PropTypes.object,
    modalPending: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entities: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      this.fetchRelEntities();

      const { form, editingRecord } = nextProps;
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          expireflag: editingRecord.expireday > 0
        });
      } else {
        form.resetFields();
      }
    }
  }

  fetchRelEntities = () => {
    const params = {
      pageIndex: 1,
      pageSize: 999,
      typeId: -1,
      entityName: '',
      status: 1
    };
    queryEntities(params).then(result => {
      const entities = result.data.pagedata;
      const entitiesRelAudit = entities.filter(
        ({ modeltype, relaudit }) => modeltype === 0 || (relaudit && modeltype === 2) || (relaudit && modeltype === 3)
      );
      this.setState({ entities: entitiesRelAudit });
    });
  };

  onOk = () => {
    const { form, editingRecord } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      // this.props.confirm({
      //   resetflag: 1,
      //   ...values,
      //   expireflag: undefined,
      //   flowid: editingRecord ? editingRecord.flowid : undefined
      // });
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const isEdit = !!this.props.editingRecord;
    return (
      <Modal
        visible={this.props.visible}
        title={isEdit ? '编辑转移方案' : '新增转移方案'}
        onCancel={this.props.cancel}
        onOk={this.onOk}
        confirmLoading={this.props.modalPending}
      >
        <Form>
          <FormItem label="转移方案名称">
            {getFieldDecorator('flowname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入流程名称' }]
            })(
              <Input placeholder="请输入流程名称" maxLength="10" />
            )}
          </FormItem>
          <FormItem label="目标转移对象">
            {getFieldDecorator('entityid', {
              rules: [{ required: true, message: '请选择关联实体' }]
            })(
              <Select placeholder="请选择关联实体">
                {this.state.entities.map(entity => (
                  <Option key={entity.entityid}>{entity.entityname}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="关联转移对象">
            {getFieldDecorator('relentityid', {
              rules: [{ required: true, message: '请选择关联转移对象' }]
            })(
              <RelTable />
            )}
          </FormItem>
          <FormItem label="备注">
            {getFieldDecorator('remark', {
              initialValue: ''
            })(
              <Input type="textarea" placeholder="请输入备注" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems, modalPending } = state.transferscheme;
    console.log(showModals)
    return {
      visible: /add|edit/.test(showModals),
      editingRecord: /edit/.test(showModals) ? currItems[0] : undefined,
      modalPending
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'transferscheme/showModals', payload: '' });
      },
      confirm(data) {
        dispatch({ type: 'transferscheme/save', payload: data });
      }
    };
  }
)(Form.create()(SchemeFormModal));
