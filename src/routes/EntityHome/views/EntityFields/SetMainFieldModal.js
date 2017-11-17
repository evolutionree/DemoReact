import React from 'react';
import { connect } from 'dva';
import { Modal, Form, Select, message } from 'antd';
import _ from 'lodash';
import { queryPageConfigInfo, savePageConfig } from '../../../../services/entity';

const FormItem = Form.Item;
const Option = Select.Option;

function isDataSourceField(field) {
  const dataSourceControlType = 18;
  return field.controltype === dataSourceControlType;
}

class SetMainFieldModal extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    // 打开窗口时，查数据
    const isOpening = !/setMainField/.test(this.props.showModals) &&
      /setMainField/.test(nextProps.showModals);
    const isClosing = /setMainField/.test(this.props.showModals) &&
      !/setMainField/.test(nextProps.showModals);
    if (isOpening) {
      this.props.form.resetFields();
      this.setState({ rawData: null });
      queryPageConfigInfo(this.props.entityId).then(result => {
        const data = result.data.noticehistorylist[0];
        if (data) {
          const subfieldids = data.subfieldids.split(',');
          const fields = { ...data, subfieldids, relfieldid: data.relfieldid || '' };
          this.props.form.setFieldsValue(fields);
          this.setState({ rawData: data });
        }
      }).catch(e => {
        message.error(e.message || '获取数据出错');
      });
    } else if (isClosing) {
      // this.props.form.resetFields();
    }
  }

  handleOk = () => {
    const fields = this.props.list;

    this.props.form.validateFields((err, values) => {
      if (err) return;
      const subfieldids = values.subfieldids.filter(id => !!id).join(',');
      const data = {
        entityid: this.props.entityId,
        modules: 'modules',
        titlefieldid: values.titlefieldid,
        titlefieldname: getFieldNames(values.titlefieldid),
        subfieldids: subfieldids,
        subfieldnames: getFieldNames(subfieldids),
        relentityid: '00000000-0000-0000-0000-000000000000',
        relfieldid: values.relfieldid || null,
        relfieldname: getFieldNames(values.relfieldid)
      };
      this.setState({ loading: true });
      savePageConfig(data).then(result => {
        message.success('保存成功');
        this.setState({ loading: false });
        this.props.cancel();
      }).catch(e => {
        message.error(e.message || '提交数据出错');
        this.setState({ loading: false });
      })
    });

    function getFieldNames(ids) {
      if (!ids) return '';
      const namesArr = ids.split(',').map(id => _.find(fields, ['fieldid', id]).displayname);
      return namesArr.join(',');
    }
  };

  renderFieldSelect = (fieldFilter) => {
    const fields = fieldFilter ? this.props.list.filter(fieldFilter) : this.props.list;
    // const enabledFields = fields.filter(field => field.recstatus === 1);
    return (
      <Select>
        <Option value="">不显示</Option>
        {fields.filter(field => [2, 15, 20, 22, 23, 24].indexOf(field.controltype) === -1).map(field => (
          <Option key={field.fieldid} value={field.fieldid} disabled={field.recstatus !== 1}>{field.displayname}</Option>
        ))}
      </Select>
    )
  };

  render() {
    const { showModals, list, form, cancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title="设置主页顶部显示字段"
        visible={/setMainField/.test(showModals)}
        onOk={this.handleOk}
        onCancel={cancel}
        confirmLoading={this.state.loading}
      >
        <Form>
          <FormItem label="主标题">
            {getFieldDecorator('titlefieldid', {
              initialValue: '',
              rules: [{ required: true, message: '请选择主标题' }]
            })(
              this.renderFieldSelect()
            )}
          </FormItem>
          <FormItem label="关联实体">
            {getFieldDecorator('relfieldid', {
              initialValue: ''
            })(
              this.renderFieldSelect(isDataSourceField)
            )}
          </FormItem>
          <FormItem label="主要字段一">
            {getFieldDecorator('subfieldids[0]', {
              initialValue: ''
            })(
              this.renderFieldSelect()
            )}
          </FormItem>
          <FormItem label="主要字段二">
            {getFieldDecorator('subfieldids[1]', {
              initialValue: ''
            })(
              this.renderFieldSelect()
            )}
          </FormItem>
          <FormItem label="主要字段三">
            {getFieldDecorator('subfieldids[2]', {
              initialValue: ''
            })(
              this.renderFieldSelect()
            )}
          </FormItem>
          <FormItem label="主要字段四">
            {getFieldDecorator('subfieldids[3]', {
              initialValue: ''
            })(
              this.renderFieldSelect()
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => state.entityFields,
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'entityFields/showModals', payload: '' });
      }
    }
  }
)(Form.create()(SetMainFieldModal));
