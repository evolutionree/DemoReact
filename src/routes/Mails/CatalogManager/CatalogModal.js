import React, { PropTypes, Component } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { connect } from 'dva';
import * as _ from 'lodash';
import MailCatalogSelect from '../MailCatalogSelect';
import { treeForEach } from '../../../utils';

const FormItem = Form.Item;

class CatalogModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, currentCatalog, isEdit } = nextProps;
      if (isEdit) {
        form.setFieldsValue({
          recname: currentCatalog.recname,
          pid: currentCatalog.pid
        });
      } else {
        form.setFieldsValue({
          recname: '',
          pid: currentCatalog.recid
        });
      }
    }
  }

  submitForm = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return message.error('请检查表单');
      const saveData = values;
      if (this.props.isEdit) {
        saveData.recid = this.props.currentCatalog.recid;
      }
      this.props.save(saveData);
    });
  };

  render() {
    const { isEdit, form, visible, cancel, modalPending, myCatalogData } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={isEdit ? '编辑文件夹' : '新增文件夹'}
        visible={visible}
        onCancel={cancel}
        onOk={this.submitForm}
        confirmLoading={modalPending}
      >
        <Form>
          <FormItem label="文件夹名称">
            {getFieldDecorator('recname', {
              initialValue: '',
              rules: [{ required: true, message: '请输入文件夹名称' }]
            })(
              <Input placeholder="请输入文件夹名称" maxLength="50" />
            )}
          </FormItem>
          {!isEdit && <FormItem label="上级文件夹">
            {getFieldDecorator('pid', {
              initialValue: '',
              rules: [{ required: true, message: '请选择上级文件夹' }]
            })(
              <MailCatalogSelect catalogData={myCatalogData} />
            )}
          </FormItem>}
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showingModals, selectedCatalogNode, myCatalogData, modalPending } = state.mails;
    return {
      visible: /addCatalog|editCatalog/.test(showingModals),
      isEdit: /editCatalog/.test(showingModals),
      currentCatalog: selectedCatalogNode,
      modalPending,
      myCatalogData
    };
  },
  dispatch => {
    return {
      save(data) {
        dispatch({ type: 'mails/saveCatalog', payload: data });
      },
      cancel() {
        dispatch({ type: 'mails/showModals', payload: '' });
      }
    };
  }
)(Form.create()(CatalogModal));
