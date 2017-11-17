import React from 'react';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import _ from 'lodash';
import ImageUploaderInForm from '../../components/ImageUploaderInForm';
import UMEditor from '../../components/UMEditor';
import RichEditorInForm from '../../components/RichEditorInForm';
import { createNotice, updateNotice, queryNoticeInfo } from '../../services/notice';
import styles from './NoticeFormModal.less';
import { convertHtmlToEditorState, convertEditorStateToHtml } from '../../utils'

const FormItem = Form.Item;

class NoticeFormModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    currentRecord: React.PropTypes.object,
    form: React.PropTypes.object,
    onDone: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
      loadingContent: false // 编辑时，需要加载内容
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    if (isOpening) {
      const { currentRecord, form } = nextProps;
      if (currentRecord) {
        form.setFieldsValue({ ...currentRecord });
        this.fetchNoticeContent(currentRecord.noticeid);
      } else {
        form.resetFields();
        this.umEditor ? this.umEditor.setContent(' ') : this.onUMEditorReady = () => this.umEditor.setContent(' ');
      }
    }
  }

  umEditorRef = umEditor => {
    this.umEditor = umEditor;
    this.onUMEditorReady && this.onUMEditorReady();
  };

  fetchNoticeContent = (noticeId) => {
    this.setState({ loadingContent: true });
    const self = this; // TODO ?
    queryNoticeInfo(noticeId)
      .then(result => {
        self.setState({ loadingContent: false });
        self.props.form.setFieldsValue({
          msgcontent: result.data.msgcontent
        });
        self.umEditor ? self.umEditor.setContent(result.data.msgcontent)
          : self.onUMEditorReady = () => self.umEditor.setContent(result.data.msgcontent);
      });
  };

  handleOk = () => {
    const { currentRecord, form } = this.props;
    form.validateFields((err, values) => {
      if (err) return;

      // const msgcontent = convertEditorStateToHtml(values.msgcontent);
      const ispopup = values.ispopup ? 1 : 0;
      const data = {
        noticetype: 0,
        noticeurl: '',
        ...values,
        // msgcontent,
        ispopup
      };

      (currentRecord ? this.postEdit : this.postAdd)(data);
    });
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  postAdd = (data) => {
    this.setState({ confirmLoading: true });
    return createNotice(data).then(result => {
      message.success('新增成功');
      this.setState({ confirmLoading: false });
      this.props.onDone();
    }).catch(e => {
      message.error(e.message || '新增失败');
      this.setState({ confirmLoading: false });
    });
  };

  postEdit = (data) => {
    this.setState({ confirmLoading: true });
    return updateNotice({
      noticeid: this.props.currentRecord.noticeid,
      ...data
    }).then(result => {
      message.success('编辑成功');
      this.setState({ confirmLoading: false });
      this.props.onDone(true);
    }).catch(e => {
      message.error(e.message || '编辑失败');
      this.setState({ confirmLoading: false });
    });
  };

  render() {
    const { form, currentRecord } = this.props;
    const { getFieldDecorator } = form;

    const isEdit = !!currentRecord;

    return (
      <Modal
        maskClosable={false}
        wrapClassName={styles.largeModal}
        title={`${isEdit ? '编辑' : '新增'}公告通知`}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        visible={this.props.visible}
        confirmLoading={this.state.confirmLoading}
      >
        <Form>
          <FormItem label="标题">
            {getFieldDecorator('noticetitle', {
              initialValue: '',
              rules: [{ required: true, message: '请输入标题' }]
            })(
              <Input placeholder="公告通知标题" maxLength={30} />
            )}
          </FormItem>
          <FormItem label="摘要">
            {getFieldDecorator('headremark', {
              initialValue: ''
            })(
              <Input placeholder="公告通知摘要" maxLength={50} />
            )}
          </FormItem>
          <FormItem label="封面">
            {getFieldDecorator('headimg', {
              initialValue: ''
            })(
              <ImageUploaderInForm
                />
            )}
          </FormItem>
          {/*<FormItem label="弹窗发布">*/}
            {/*{getFieldDecorator('ispopup', {*/}
              {/*valuePropName: 'checked'*/}
            {/*})(*/}
              {/*<Checkbox>勾选后，再次进入手机端时会弹窗展示公告通知的摘要</Checkbox>*/}
            {/*)}*/}
          {/*</FormItem>*/}
          <FormItem label="内容">
            {getFieldDecorator('msgcontent', {
              initialValue: '',
              rules: [{ required: true, message: '请输入内容' }]
            })(
              <UMEditor ref={this.umEditorRef} loading={this.state.loadingContent} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create({
  mapPropsToFields: ({ currentRecord }) => {
    if (!currentRecord) return {};
    return _.mapValues(currentRecord, (val, key) => {
      // if (key === 'msgcontent') {
      //   return { value: convertHtmlToEditorState(val) };
      // } else {
        return { value: val };
      // }
    });
  }
})(NoticeFormModal);
