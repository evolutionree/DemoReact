import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Icon, Input, Modal, Select, Upload, message, Tabs, Checkbox, Row, Col, InputNumber } from 'antd';
import * as _ from 'lodash';
import request, { getDeviceHeaders } from '../../utils/request';
import CodeEditor from '../../components/CodeEditor/index';
import { downloadFile } from '../../utils/ukUtil';
import s from './index.less';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

/**
 * 
 * @param {原生Dom节点} f 
 * @param {插入的字符串} value 
 * @return {返回新的value}
 */
export function insertAtCursor(f, value) {
  /* eslint-disable */
  let field = f;
  let newValue = '';
  // IE support
  if (document.selection) {
    field.focus();
    const sel = document.selection.createRange();
    sel.text = newValue = value;
    sel.select();
  } else if (field.selectionStart || field.selectionStart === 0) {
    const startPos = field.selectionStart;
    const endPos = field.selectionEnd;
    const restoreTop = field.scrollTop;
    newValue = field.value.substring(0, startPos) +
      value +
      field.value.substring(endPos, field.value.length);
    if (restoreTop > 0) {
      field.scrollTop = restoreTop;
    }
    field.focus();
    // 重新设置光标的位置
    setTimeout(() => {
      field.selectionStart = startPos + value.length
      field.selectionEnd = startPos + value.length
    }, 0)
  } else {
    newValue = field.value + value
    field.focus();
  }
  return newValue;
}

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const TMPTYPE = '0'

const tmpTypeConfig = [
  {
    name: 'Excel',
    accept: '.xlsx'
  },
  {
    name: 'Word',
    accept: '.docx'
  }
]


class PrintTemplateForm extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isJsEditing: false,
      jsCode: '',
      jsCodeEditing: '',
      activeKey: '1',
      tmpType: TMPTYPE
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClose = this.props.visible && !nextProps.visible;
    const { form } = nextProps;
    if (isOpening) {
      const { editingRecord } = nextProps;
      if (editingRecord) {
        const { exportconfig, ...resRedord } = editingRecord;
        const result = _.mapValues(resRedord, (value, key) => {
          if (key === 'templatetype' || key === 'datasourcetype') {
            return { value: (value || value === 0) ? (value + '') : undefined };
          } else if (key === 'fileid') {
            const _val = value ? [{
              uid: value,
              fileid: value,
              name: editingRecord.templatename || (value + ''),
              status: 'done',
              isInitValue: true
            }] : [];
            return { value: _val };
          } else {
            return { value: value };
          }
        });
        const setData = {
          jsCode: editingRecord.extjs || '',
          jsCodeEditing: editingRecord.extjs || ''
        }

        if (exportconfig) {
          const { exportexcel, exportpdf, pdfconfig } = exportconfig;
          result.exportexcel = { value: exportexcel === 'true' ? true : false };
          result.exportpdf = { value: exportpdf === 'true' ? true : false };
          if (pdfconfig) {
            const { hasimagewatermark, hastextwatermark, fillopacity, pagesize, imagewatermark, textwatermark } = pdfconfig;
            result.hasimagewatermark = { value: hasimagewatermark === 'true' ? true : false };
            result.hastextwatermark = { value: hastextwatermark === 'true' ? true : false };
            result.fillopacity = { value: fillopacity * 10 };
            result.pagesize = { value: pagesize };
            if (textwatermark) {
              const { fontcolor, fontsize, rotateancle, watermarktext } = textwatermark;
              result.fontcolor = { value: fontcolor };
              result.fontsize = { value: Number(fontsize) };
              result.textRotateAncle = { value: Number(rotateancle) };
              result.watermarktext = { value: watermarktext };
            }
            if (imagewatermark) {
              const { image, imageposition, rotateancle } = imagewatermark;
              result.imageposition = { value: imageposition };
              result.imgRotateAncle = { value: Number(rotateancle) };
              setData.imgFileid = image;
              setData.avatarUrl = `/api/fileservice/read?fileid=${image}&filetype=3`
            }
          }
        }
        form.setFields(result);
        this.setState(setData);
      }
    } else if (isClose) {
      form.resetFields();
      this.setState({
        jsCode: '',
        jsCodeEditing: '',
        activeKey: '1',
        avatarUrl: undefined,
        avatarFile: undefined,
        imgFileid: undefined
      });
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
      callback();
    }
  };

  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  onDownloadFile = (file) => {
    downloadFile(`/api/fileservice/read?fileid=${file.fileid}`);
  }

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
    const _fileList = fileList.filter(file => file && file.status && file.status !== 'removed').slice(-1);
    if (file.response && file.response.error_code === 0) {
      return [{
        uid: file.uid,
        fileid: file.response.data,
        name: file.name,
        size: file.size,
        status: 'done'
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
      const { imgFileid } = this.state;
      const {
        exportexcel, exportpdf, hastextwatermark, hasimagewatermark,
        fillopacity, fontcolor, fontsize, imageposition, imgRotateAncle, pagesize, textRotateAncle, watermarktext,
        ...rest
      } = values;
      const exportconfig = { exportexcel: String(exportexcel), exportpdf: String(exportpdf) };
      const params = {
        datasourcefunc: isEdit ? editingRecord.datasourcefunc : '',
        description: '',
        ruledesc: '',
        ...rest,
        extjs: this.state.jsCode,
        fileid: values.fileid[0].fileid,
        recid: isEdit ? editingRecord.recid : undefined,
        entityid: entityId
      };

      let pdfconfig;
      if (exportpdf) {
        pdfconfig = {
          hastextwatermark: String(hastextwatermark),
          hasimagewatermark: String(hasimagewatermark),
          fillopacity: String(fillopacity / 10),
          pagesize: '1'
        };

        if (hastextwatermark) {
          if (!watermarktext) {
            message.warn('请输入文字水印信息');
            return;
          }
          const rotateancle = _.isNumber(textRotateAncle) ? String(textRotateAncle) : String(0);
          pdfconfig.textwatermark = { fontcolor, fontsize: String(fontsize), rotateancle, watermarktext };
        }
        if (hasimagewatermark) {
          if (!imgFileid) {
            message.warn('请上传水印图片');
            return;
          }
          const rotateancle = _.isNumber(imgRotateAncle) ? String(imgRotateAncle) : String(0);
          pdfconfig.imagewatermark = { image: imgFileid, imageposition, rotateancle };
        }
      }
      exportconfig.pdfconfig = pdfconfig;
      params.exportconfig = JSON.stringify(exportconfig);
      this.props.save(params);
    });
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

  onAvatarChange = (file) => {
    getBase64(file, imageUrl => this.setState({
      avatarUrl: imageUrl,
      avatarFile: file
    }));
    const formData = new FormData();
    formData.append('filename', file.name);
    formData.append('data', file);
    request('api/fileservice/upload', {
      method: 'post',
      body: formData
    }).then(result => {
      this.setState({ imgFileid: result.data });
    }).catch(e => {
      message.error(e.message);
    });
  }

  addText = (text) => () => {
    const newValue = insertAtCursor(this.area.textAreaRef, text);
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ watermarktext: newValue });
  }

  onChangeTmpType = (val) => {
    const { onChange } = this.props
    this.setState({ tmpType: val })
    if (onChange) onChange(val)
  }

  render() {
    const { isEdit, form, visible, modalPending } = this.props;
    const { tmpType } = this.state

    const { getFieldDecorator, getFieldValue, getFieldsValue } = form;
    const srctype = getFieldValue('datasourcetype');
    const formItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 19 } };
    const { avatarUrl } = this.state;
    const { exportpdf, hasimagewatermark, hastextwatermark } = getFieldsValue();
    return (
      <Modal
        visible={visible}
        title={isEdit ? '编辑模板' : '新增模板'}
        onCancel={this.props.cancel}
        onOk={this.handleOk}
        confirmLoading={modalPending}
        wrapClassName={s.temModal}
      >
        <Form layout="horizontal">
          <Tabs activeKey={this.state.activeKey} onChange={v => this.setState({ activeKey: v })}>
            <TabPane tab="基本信息" key="1">
              <FormItem label="模板名称" {...formItemLayout}>
                {getFieldDecorator('templatename', {
                  rules: [{ required: true, message: '请输入模板名称' }]
                })(
                  <Input maxLength="50" placeholder="请输入模板名称" />
                )}
              </FormItem>
              <FormItem label="数据源类型" {...formItemLayout}>
                {getFieldDecorator('datasourcetype', {
                  rules: [{ required: true, message: '请选择数据源类型' }]
                })(
                  <Select placeholder="请选择数据源类型">
                    <Option value="0">通用详情接口</Option>
                    <Option value="1" disabled="disabled" >数据库函数</Option>
                    <Option value="2">内部服务接口</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="数据源接口" style={{ display: srctype === '1' ? 'block' : 'none' }} {...formItemLayout}>
                {getFieldDecorator('datasourcefunc', {
                  rules: [{ required: srctype === '1', message: '请输入数据源接口' }]
                })(
                  <Input maxLength="50" placeholder="请输入数据源接口" />
                )}
              </FormItem>
              <FormItem label="程序集" style={{ display: srctype === '21' ? 'block' : 'none' }} {...formItemLayout}>
                {getFieldDecorator('assemblyname', {
                  rules: [{ required: srctype === '21', message: '请填写引用的程序集名称' }]
                })(
                  <Input maxLength="50" placeholder="请填写引用的程序集名称" />
                )}
              </FormItem>
              <FormItem label="类及方法" style={{ display: srctype === '2' ? 'block' : 'none' }} {...formItemLayout}>
                {getFieldDecorator('classtypename', {
                  rules: [{ required: srctype === '2', message: '请填写引用的类名和方法名称' }]
                })(
                  <Input maxLength="5000" placeholder="请填写引用的类名和方法名称" />
                )}
              </FormItem>
              {/*<FormItem label="数据源JS" {...formItemLayout}>*/}
              {/*<Button onClick={this.openJsEdit}>编辑JS</Button>*/}
              {/*</FormItem>*/}
              <FormItem label="模板类型" {...formItemLayout}>
                {getFieldDecorator('templatetype', {
                  initialValue: TMPTYPE,
                  rules: [{ required: true, message: '请选择模板类型' }]
                })(
                  <Select placeholder="请选择模板类型" onChange={this.onChangeTmpType}>
                    <Option value="0">Excel模板</Option>
                    <Option value="1">Word模板</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label="模板文件" {...formItemLayout}>
                {getFieldDecorator('fileid', {
                  rules: [
                    { required: true, type: 'array', message: '请上传模板文件' },
                    { validator: this.validateFile }
                  ],
                  valuePropName: 'fileList',
                  getValueFromEvent: this.handleUploadChange
                })(
                  <Upload
                    name="data"
                    action="/api/fileservice/upload"
                    accept={tmpTypeConfig[tmpType].accept}
                    data={this.getUploadParams}
                    beforeUpload={this.beforeUpload}
                    onPreview={this.onDownloadFile}
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
              <FormItem label="模板备注" {...formItemLayout}>
                {getFieldDecorator('description')(
                  <Input.TextArea maxLength="500" placeholder="请输入模板备注" />
                )}
              </FormItem>
              <FormItem label="适用范围说明" {...formItemLayout}>
                {getFieldDecorator('ruledesc')(
                  <Input.TextArea maxLength="500" placeholder="请输入适用范围说明" />
                )}
              </FormItem>
              <FormItem label={`${tmpTypeConfig[tmpType].name}输出`} {...formItemLayout}>
                {getFieldDecorator('exportexcel', {
                  valuePropName: 'checked',
                  initialValue: true
                })(
                  <Checkbox />
                )}
              </FormItem>

              <FormItem label="PDF输出" {...formItemLayout}>
                {getFieldDecorator('exportpdf', {
                  valuePropName: 'checked',
                  initialValue: false
                })(
                  <Checkbox />
                )}
              </FormItem>
            </TabPane>
            {exportpdf && tmpType !== '1' ? (
              <TabPane tab="PDF设置" key="2">
                {/* <div className={s.wrap}>
                纸张类型:
                {getFieldDecorator('pagesize', {
                  initialValue: '1'
                })(
                  <Select placeholder="请选择纸张类型" className={s.select}>
                    <Option value="1">A4-纵向</Option>
                    <Option value="2">A4-横向</Option>
                  </Select>
                )}
                </div> */}
                <FormItem {...formItemLayout}>
                  {getFieldDecorator('hastextwatermark', {
                    valuePropName: 'checked',
                    initialValue: false
                  })(
                    <Checkbox>添加文字水印</Checkbox>
                  )}
                </FormItem>
                {hastextwatermark ? (
                  <div className={s.wrapItem}>
                    <Row>
                      <Col span={17}>
                        {getFieldDecorator('watermarktext', {
                          initialValue: ''
                        })(
                          <Input.TextArea ref={d => this.area = d} rows={4} placeholder="请输入文字水印信息" />
                        )}
                      </Col>
                      <Col span={7} className={s.right}>
                        <Button onClick={this.addText('{{company}}')}>添加公司名称</Button>
                        <Button className={s.middle} onClick={this.addText('{{user}}')}>添加用户名称</Button>
                        <Button onClick={this.addText('{{time}}')}>添加输出时间</Button>
                      </Col>
                    </Row>
                    <Row gutter={8} className={s.bottom}>
                      <Col span={8}>
                        字体颜色:
                        {getFieldDecorator('fontcolor', {
                          initialValue: '#000000'
                        })(
                          <Input type="color" className={s.input} />
                        )}
                      </Col>
                      <Col span={8}>
                        字体大小:
                        {getFieldDecorator('fontsize', {
                          initialValue: 12
                        })(
                          <InputNumber
                            min={12}
                            max={100}
                            className={s.input}
                            formatter={value => `${value}px`}
                            parser={value => value.replace('px', '')}
                          />
                        )}
                      </Col>
                      <Col span={8}>
                        旋转角度:
                    {getFieldDecorator('textRotateAncle', {
                          initialValue: 0
                        })(
                          <InputNumber
                            min={0}
                            max={360}
                            className={s.input}
                            formatter={value => `${value || 0}°`}
                            parser={value => value.replace('°', '')}
                          />
                        )}
                      </Col>
                    </Row>
                  </div>
                ) : null}

                <FormItem {...formItemLayout}>
                  {getFieldDecorator('hasimagewatermark', {
                    valuePropName: 'checked',
                    initialValue: false
                  })(
                    <Checkbox>添加图片水印</Checkbox>
                  )}
                </FormItem>
                {hasimagewatermark ? (
                  <div className={s.wrapItem}>
                    <Row>
                      <Upload beforeUpload={this.onAvatarChange} customRequest={() => { }} showUploadList={false}>
                        <div className={s.uploadPreview}>
                          {
                            avatarUrl ? (<img src={avatarUrl} className={s.image} />) : <Icon type="plus" className={s.icon} />
                          }
                        </div>
                        <p className={s.tips}>
                          建议选择300*200尺寸的图片，类型：jpg、png
                        </p>
                      </Upload>
                    </Row>
                    <Row gutter={8}>
                      <Col span={8}>
                        旋转角度:
                        {getFieldDecorator('imgRotateAncle', {
                          initialValue: 0
                        })(
                          <InputNumber
                            min={0}
                            max={360}
                            className={s.input}
                            formatter={value => `${value || 0}°`}
                            parser={value => value.replace('°', '')}
                          />
                        )}
                      </Col>
                      <Col span={16}>
                        位置:
                    {getFieldDecorator('imageposition', {
                          initialValue: '5'
                        })(
                          <Select placeholder="请选择纸张类型" className={s.select}>
                            <Option value="5">页面中央</Option>
                            <Option value="1">左上</Option>
                            <Option value="2">顶端居中</Option>
                            <Option value="3">右上</Option>
                            <Option value="6">垂直靠右</Option>
                            <Option value="9">右下</Option>
                            <Option value="8">底端居中</Option>
                            <Option value="7">左下</Option>
                            <Option value="4">垂直靠左</Option>
                          </Select>
                        )}
                      </Col>
                    </Row>
                  </div>
                ) : null}

                <div className={s.wrap}>
                  透明度:
                  {getFieldDecorator('fillopacity', {
                    initialValue: 10
                  })(
                    <InputNumber
                      formatter={value => value / 10}
                      parser={value => value.replace('0.', '')}
                      min={0}
                      max={10}
                      className={s.input}
                    />
                  )}
                </div>
              </TabPane>
            ) : null}
          </Tabs>
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
    };
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
)(Form.create({})(PrintTemplateForm));
