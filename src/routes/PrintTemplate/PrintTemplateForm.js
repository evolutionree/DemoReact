import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Icon, Input, Modal, Radio, Select, Upload, message } from 'antd';
import * as _ from 'lodash';
import { getDeviceHeaders } from '../../utils/request';
import CodeEditor from '../../components/CodeEditor/index'

const FormItem = Form.Item;
const Option = Select.Option;

class PrintTemplateForm extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isJsEditing: false,
      jsCode: '',
      jsCodeEditing: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { form, editingRecord } = nextProps;
      if (editingRecord) {
        form.setFields(_.mapValues(editingRecord, (value, key) => {
          if (key === 'templatetype' || key === 'datasourcetype') {
            return { value: (value || value === 0) ? (value + '') : undefined };
          } else if (key === 'fileid') {
            const _val = value ? [{
              uid: value,
              fileid: value,
              name: value + '',
              status: 'done',
              isInitValue: true
            }] : [];
            return { value: _val };
          } else {
            return { value: value };
          }
        }));
        this.setState({
          jsCode: editingRecord.extjs || '',
          jsCodeEditing: editingRecord.extjs || ''
        });
      } else {
        form.resetFields();
        this.setState({
          jsCode: '',
          jsCodeEditing: ''
        });
      }
    }
  }

  // 校验是否上传了文件
  validateFile = (rule, value, callback) => {
    if (value && value.length) {
      if (value[0].status === 'error') {
        callback('请重新上传模板文件');
      } else if (!value[0].isInitValue && !/\.xlsx$|\.docx$/.test(value[0].name)) {
        callback('只支持.xlsx和.docx格式的文件');
      } else {
        callback();
      }
    } else {
      callback('请上传模板文件');
    }
  };

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  beforeUpload = file => {
    if (file.size > 1024 * 1024 * 100) {
      message.error('文件大小不可超过100M');
      return false;
    }
    return true;
  };

  handleUploadChange = ({ file, fileList }) => {
    // const { file } = event;
    // if (Array.isArray(event)) {
    //   return event;
    // }
    let _fileList = fileList.filter(file => file && file.status && file.status !== 'removed').slice(-1);
    if (file.response && file.response.error_code === 0) {
      return [{
        uid: file.uid,
        fileid: file.response.data,
        name: file.name,
        size: file.size,
        status: 'done',
        // url: `/api/fileservice/download?fileid=${file.response.data}`
      }];
    } else if (file.response && file.response.error_code) {
      message.error(file.response.error_msg);
    }
    return _fileList;
  };

  handleOk = () => {
    const { form, editingRecord, isEdit, entityId } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      if (values.fileid[0].status === 'uploading') {
        message.error('请等待模板文件上传完毕');
        return;
      }
      // values.fileid = values.fileid[0].fileid;
      // values.templatetype = +values.templatetype;
      // values.datasourcetype = +values.datasourcetype;
      this.props.save({
        datasourcefunc: isEdit ? editingRecord.datasourcefunc : '',
        description: '',
        ruledesc: '',
        ...values,
        extjs: this.state.jsCode,
        fileid: values.fileid[0].fileid,
        recid: isEdit ? editingRecord.recid : undefined,
        entityid: isEdit ? undefined : entityId
      });
    })
  };

  openJsEdit = () => {
    this.setState({
      isJsEditing: true
    });
  };

  saveJsEdit = () => {
    this.setState({
      isJsEditing: false,
      jsCode: this.state.jsCodeEditing
    });
  };

  cancelJsEdit = () => {
    this.setState({
      isJsEditing: false,
      jsCodeEditing: this.state.jsCode
    });
  };

  onJsEditingContentChange = (val) => {
    this.setState({
      jsCodeEditing: val
    });
  };

  render() {
    const { isEdit, form, visible, modalPending } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const srctype = getFieldValue('datasourcetype');
    return (
      <Modal
        visible={visible}
        title={isEdit ? '编辑模板' : '新增模板'}
        onCancel={this.props.cancel}
        onOk={this.handleOk}
        confirmLoading={modalPending}
      >
        <Form layout="horizontal">
          <FormItem label="模板名称">
            {getFieldDecorator('templatename', {
              rules: [{ required: true, message: '请输入模板名称' }]
            })(
              <Input maxLength="50" placeholder="请输入模板名称" />
            )}
          </FormItem>
          <FormItem label="数据源类型">
            {getFieldDecorator('datasourcetype', {
              rules: [{ required: true, message: '请选择数据源类型' }]
            })(
              <Select placeholder="请选择数据源类型">
                <Option value="0">通用详情接口</Option>
                <Option value="1">数据库函数</Option>
                <Option value="2">内部服务接口</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="数据源接口" style={{ display: srctype === '1' ? 'block' : 'none' }}>
            {getFieldDecorator('datasourcefunc', {
              rules: [{ required: srctype === '1', message: '请输入数据源接口' }]
            })(
              <Input maxLength="50" placeholder="请输入数据源接口" />
            )}
          </FormItem>
          <FormItem label="程序集" style={{ display: srctype === '2' ? 'block' : 'none' }}>
            {getFieldDecorator('assemblyname', {
              rules: [{ required: srctype === '2', message: '请填写引用的程序集名称' }]
            })(
              <Input maxLength="50" placeholder="请填写引用的程序集名称" />
            )}
          </FormItem>
          <FormItem label="类名" style={{ display: srctype === '2' ? 'block' : 'none' }}>
            {getFieldDecorator('classtypename', {
              rules: [{ required: srctype === '2', message: '请填写引用的类名' }]
            })(
              <Input maxLength="50" placeholder="请填写引用的类名" />
            )}
          </FormItem>
          <FormItem label="数据源JS">
            <Button onClick={this.openJsEdit}>编辑JS</Button>
          </FormItem>
          <FormItem label="模板类型">
            {getFieldDecorator('templatetype', {
              rules: [{ required: true, message: '请选择模板类型' }]
            })(
              <Select placeholder="请选择模板类型">
                <Option value="0">Excel模板</Option>
                <Option value="1">Word模板</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="模板文件">
            {getFieldDecorator('fileid', {
              rules: [,
                { required: true, type: 'array', message: '请上传模板文件' },
                { validator: this.validateFile }
              ],
              valuePropName: 'fileList',
              getValueFromEvent: this.handleUploadChange,
            })(
              <Upload
                name="data"
                action="/api/fileservice/upload"
                accept=".xlsx,.docx"
                data={this.getUploadParams}
                beforeUpload={this.beforeUpload}
                headers={{
                  ...getDeviceHeaders(),
                  Authorization: 'Bearer ' + this.props.token
                }}
              >
                <Button>
                  <Icon type="upload" /> 上传
                </Button>
              </Upload>
            )}
          </FormItem>
          <FormItem label="模板备注">
            {getFieldDecorator('description')(
              <Input.TextArea maxLength="500" placeholder="请输入模板备注" />
            )}
          </FormItem>
          <FormItem label="适用范围说明">
            {getFieldDecorator('ruledesc')(
              <Input.TextArea maxLength="500" placeholder="请输入适用范围说明" />
            )}
          </FormItem>
        </Form>
        <Modal
          title="编辑JS"
          visible={this.state.isJsEditing}
          onOk={this.saveJsEdit}
          onCancel={this.cancelJsEdit}
          wrapClassName="code-editor-modal"
          width={750}
        >
          <CodeEditor
            value={this.state.jsCodeEditing}
            onChange={this.onJsEditingContentChange}
          />
        </Modal>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currentItems, modalPending, queries } = state.printTemplate;
    const isEdit = /edit/.test(showModals);
    return {
      token: state.app.token,
      visible: /add|edit/.test(showModals),
      entityId: queries.entityId,
      isEdit: isEdit,
      modalPending: modalPending,
      editingRecord: isEdit ? currentItems[0] : undefined
    }
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'printTemplate/showModals', payload: '' });
      },
      save(data) {
        dispatch({ type: 'printTemplate/save', payload: data });
      }
    };
  }
)(Form.create()(PrintTemplateForm));
