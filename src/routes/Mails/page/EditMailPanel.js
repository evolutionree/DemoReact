/**
 * Created by 0291 on 2017/11/6.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Modal, Icon, Upload, message, Checkbox, Select } from 'antd';
import { getDeviceHeaders } from '../../../utils/request';
import Toolbar from '../../../components/Toolbar';
import Styles from './EditMailPanel.less';
import UMEditor from '../../../components/UMEditor';
import Form from '../component/Form';
import AddressList from '../component/AddressList';

const confirm = Modal.confirm;


class EditMailPanel extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      formModel: [
        {
          label: '收件人',
          name: 'ToAddress',
          type: 'multipleInput',
          show: true
        },
        {
          label: '抄送',
          name: 'CCAddress',
          type: 'multipleInput',
          show: false
        },
        {
          label: '密送',
          name: 'BCCAddress',
          type: 'multipleInput',
          show: false
        },
        {
          label: '主题',
          name: 'subject',
          type: 'normalInput',
          show: true
        }
      ],
      dynamicOperateBtn: [
        {
          label: '添加抄送',
          name: 'addCS',
          show: true
        },
        {
          label: '删除抄送',
          name: 'delCS',
          show: false
        },
        {
          label: '添加密送',
          name: 'addMS',
          show: true
        },
        {
          label: '删除密送',
          name: 'delMS',
          show: false
        }
      ],
      UMEditorContent: this.props.initContent,
      fromAddress: this.getDefaultFromAddress(this.props.mailBoxList),
      AttachmentFile: [],
      totalFileSize: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fromAddress: this.getDefaultFromAddress(nextProps.mailBoxList),
      UMEditorContent: nextProps.initContent
    });
    if (nextProps.type !== this.props.type) {
      this.umEditor.setContent(nextProps.initContent);
    }
  }

  componentDidMount() {
    this.umEditor.setContent(this.state.UMEditorContent);
  }

  getDefaultFromAddress(mailBoxList) {
    let returnData = '';
    if (mailBoxList && mailBoxList instanceof Array && mailBoxList.length > 0) {
      returnData = mailBoxList[0].recid;
    }
    return returnData;
  }

  umEditorRef = umEditor => {
    this.umEditor = umEditor;
    this.onUMEditorReady && this.onUMEditorReady();
  }

  closePanel() {
    this.props.dispatch({ type: 'mails/putState', payload: { showingModals: '' } });
  }

  changeFormModal(type) {
    let formModel = this.state.formModel;
    let dynamicOperateBtn = this.state.dynamicOperateBtn;
    switch (type) {
      case 'addCS':
        dynamicOperateBtn[0].show = false;
        dynamicOperateBtn[1].show = true;
        formModel[1].show = true;
        break;
      case 'delCS':
        dynamicOperateBtn[0].show = true;
        dynamicOperateBtn[1].show = false;
        formModel[1].show = false;
        break;
      case 'addMS':
        dynamicOperateBtn[2].show = false;
        dynamicOperateBtn[3].show = true;
        formModel[2].show = true;
        break;
      case 'delMS':
        dynamicOperateBtn[2].show = true;
        dynamicOperateBtn[3].show = false;
        formModel[2].show = false;
        break;
    }
    this.setState({
      formModel: formModel,
      dynamicOperateBtn: dynamicOperateBtn
    });
  }

  sendMail() {
    const mailBoxList = this.props.mailBoxList; //发件人列表数据
    const formData = this.props.editEmailFormData;
    let formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);

    let submitData = {};
    formModel && formModel instanceof Array && formModel.map((item) => { //筛选出当前表单显示的数据
      submitData[item.name] = formData[item.name];
    });

    for (let key in submitData) {
      if (key !== 'subject') {
        if (getTransformAddress(submitData[key])) {
          submitData[key] = getTransformAddress(submitData[key]);  //转换成后端要求的格式
        } else {
          message.warning('收件人邮箱格式存在错误,请修正后再发送');
          return;
        }
      }
    }

    if (mailBoxList && mailBoxList instanceof Array) {
      for (let i = 0; i < mailBoxList.length; i++) {
        if (mailBoxList[i].recid === this.state.fromAddress) {
          submitData.fromaddress = mailBoxList[i].accountid;
          submitData.fromname = mailBoxList[i].recname;
          break;
        }
      }
    }

    submitData.AttachmentFile = this.state.AttachmentFile; //附件数据
    submitData.bodycontent = this.state.UMEditorContent; //富文本框数据

    if (submitData.subject === 0 || !submitData.subject) {
      confirm({
        title: '您的邮件没有填写主题',
        content: '您确定继续发送？',
        onOk: () => {
          this.props.dispatch({ type: 'mails/sendemail', payload: submitData });
        },
        onCancel() {

        }
      });
    } else {
      this.props.dispatch({ type: 'mails/sendemail', payload: submitData });
    }

    function getTransformAddress(data) {
      let returnData = [];
      if (data && data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
          if (!regTest(data[i].email)) {
           return false;
          }
          returnData.push({
            address: data[i].email,
            displayname: data[i].name
          });
        }
      }
      return returnData;
    }

    function regTest(value) {
      const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      return reg.test(value);
    }
  }

  UMEditorContentChangeHandler(content) {
    this.setState({
      UMEditorContent: content
    });
  }

  beforeUpload = (file) => {
    if (this.state.totalFileSize + file.size > 1024 * 1024 * 1024 * 4) {
      message.error('文件大小不可超过4G');
      return false;
    }
    return true;
  };

  handleUploadChange = ({ file, fileList }) => {
    console.log(JSON.stringify(fileList))
    if (file.response && file.response.error_code === 0) {
      // 上传成功，拿uuid
      this.setState({
        AttachmentFile: fileList && fileList instanceof Array && fileList.map((item) => {
          return {
            fileid: item.response.data, //附件人
            filetype: 1 //新文件
          };
        }),
        totalFileSize: fileList.reduce((prev, cur) => cur.size + prev, 0)
      });
    }
  };


  fromAddressSelectHandler(value) { //更新发送人
    this.setState({
      fromAddress: value
    });
  }


  getUploadParams = (file) => {
    return {
      filename: file.name
    };
  };

  render() {
    console.log(JSON.stringify(this.props.mailSelected));
    const props = {
      name: 'data',
      data: this.getUploadParams,
      action: '/api/fileservice/upload',
      headers: {
        ...getDeviceHeaders(),
        Authorization: 'Bearer ' + this.props.token
      },
      beforeUpload: this.beforeUpload,
      onChange: this.handleUploadChange
    };

    const formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);
    const editMailType = this.props.type;
    let visible = false;
    if (editMailType === 'editMail' || editMailType === 'replay' || editMailType === 'replay-attach' || editMailType === 'reply-all' || editMailType === 'replay-all-attach' || editMailType === 'send' || editMailType === 'send-attach') {
      visible = true;
    }

    return (
      <div className={Styles.editMailWrap} style={{ width: 'calc(100% - 10px)', height: 'calc(100% - 10px)', display: visible ? 'block' : 'none' }}>
        <div className={Styles.head}>
          新邮件
        </div>
        <div style={{ width: 'calc(100% - 220px)', float: 'left' }}>
          <div>
            <Toolbar style={{ paddingTop: '10px', paddingLeft: '10px' }}>
              <Button onClick={this.sendMail.bind(this)}>发送</Button>
              <Button className="grayBtn" onClick={this.closePanel.bind(this)}>取消</Button>
              {
                this.state.dynamicOperateBtn && this.state.dynamicOperateBtn instanceof Array && this.state.dynamicOperateBtn.map((item, index) => {
                  if (item.show) {
                    return <Button key={index} ghost onClick={this.changeFormModal.bind(this, item.name)}>{item.label}</Button>;
                  }
                })
              }
            </Toolbar>
          </div>
          <Form model={formModel} ref={ref => this.FormRef = ref} />
          <Upload {...props}>
            <div className={Styles.attachmentWrap}>
              <Icon type="link" /><span>添加附件</span><span>(4GB)</span>
            </div>
          </Upload>
          <div className={Styles.UMEditorWrap}>
            <UMEditor useImageBase64 ref={this.umEditorRef} loading={false} onChange={this.UMEditorContentChangeHandler.bind(this)} />
          </div>
          <div>
            <div className={Styles.footer}>
              <Select style={{ width: 250 }} value={this.state.fromAddress} onSelect={this.fromAddressSelectHandler.bind(this)}>
                {
                  this.props.mailBoxList && this.props.mailBoxList instanceof Array && this.props.mailBoxList.map((item, index) => {
                    return (
                      <Select.Option key={item.recid}>{`${item.recname} <${item.accountid}>`}</Select.Option>
                    );
                  })
                }
              </Select>
              <span>
                <Checkbox>带签名</Checkbox>
              </span>
            </div>
          </div>
          <div>
            <Toolbar style={{ paddingTop: '10px', paddingLeft: '10px' }}>
              <Button onClick={this.sendMail.bind(this)}>发送</Button>
              <Button className="grayBtn" onClick={this.closePanel.bind(this)}>取消</Button>
            </Toolbar>
          </div>
        </div>
        <div style={{ width: 220, float: 'left', height: 'calc(100% - 42px)' }}>
          <AddressList model={formModel} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return { ...state.mails, ...state.app };
  },
  dispatch => {
    return {
      dispatch
    };
  }
)(EditMailPanel);
