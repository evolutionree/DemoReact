import React, { PropTypes, Component } from 'react';
import { Form, Modal, Input, message, Checkbox } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import DeptSelect from './DeptSelect';

const FormItem = Form.Item;

class FolderFormModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    currentFolder: PropTypes.object,
    modalPending: PropTypes.bool,
    visible: PropTypes.bool,
    isEdit: PropTypes.bool,
    cancel: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired
  };
  static defaultProps = {
    currentFolder: {},
    modalPending: false,
    visible: false,
    isEdit: false
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, currentFolder, isEdit } = nextProps;
      if (isEdit) {
        form.setFieldsValue({
          folderName: currentFolder.foldername,
          permissionids: currentFolder.isallvisible !== 1 ? currentFolder.permissionids : '',
          isallvisible: currentFolder.isallvisible === 1
        });
      } else {
        form.setFieldsValue({
          folderName: '',
          permissionids: '',
          isallvisible: true
        });
      }
    }
  }

  submitForm = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return message.error('请检查表单');
      this.props.save(values);
    });
  };

  onDeptChange = (dept) => {
    if (dept) {
      this.props.form.setFieldsValue({ isallvisible: false });
    } else {
      this.props.form.setFieldsValue({ isallvisible: true });
    }
  };

  onAllVisibleChange = event => {
    if (event.target.checked) {
      this.props.form.setFieldsValue({ permissionids: '' });
    }
  };

  render() {
    const { isEdit, form, visible, cancel, modalPending } = this.props;
    const { getFieldDecorator } = form;
    const permissionids = form.getFieldValue('permissionids');
    return (
      <Modal
        title={isEdit ? '编辑目录' : '新增目录'}
        visible={visible}
        onCancel={cancel}
        onOk={this.submitForm}
        confirmLoading={modalPending}
      >
        <Form>
          <FormItem label="名称">
            {getFieldDecorator('folderName', {
              initialValue: '',
              rules: [{ required: true, message: '请输入目录名称' }]
            })(
              <Input placeholder="请输入目录名称" />
            )}
          </FormItem>
          <FormItem label="可见团队">
            {getFieldDecorator('permissionids', {
              initialValue: ''
            })(
              <DeptSelect onChange={this.onDeptChange} />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('isallvisible', {
              initialValue: true,
              valuePropName: 'checked'
            })(
              <Checkbox disabled={!permissionids} onChange={this.onAllVisibleChange}>全公司可见</Checkbox>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, folder, queries, modalPending } = state.knowledge;
    const currentFolder = _.find(folder, ['folderid', queries.folderId]);
    return {
      currentFolder,
      modalPending,
      visible: /addFolder|editFolder/.test(showModals),
      isEdit: /editFolder/.test(showModals)
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'knowledge/showModals', payload: '' });
      },
      save(data) {
        dispatch({ type: 'knowledge/saveFolder', payload: data });
      }
    };
  }
)(Form.create()(FolderFormModal));
