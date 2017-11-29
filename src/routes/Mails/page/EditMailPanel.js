/**
 * Created by 0291 on 2017/11/6.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Modal, Icon, Upload, message, Checkbox, Select } from 'antd';
import request, { getDeviceHeaders } from '../../../utils/request';
import Toolbar from '../../../components/Toolbar';
import UMEditor from '../../../components/UMEditor';
import Form from '../component/Form';
import AddressList from '../component/AddressList'; //通讯录
import _ from 'lodash';
import Styles from './EditMailPanel.less';

const confirm = Modal.confirm;

const formDataField = {
  ToAddress: 'ToAddress',
  CCAddress: 'CCAddress',
  BCCAddress: 'BCCAddress',
  subject: 'subject'
}

const formModel = [
  {
    label: '收件人',
    name: formDataField.ToAddress,
    type: 'multipleInput',
    show: true
  },
  {
    label: '抄送',
    name: formDataField.CCAddress,
    type: 'multipleInput',
    show: false
  },
  {
    label: '密送',
    name: formDataField.BCCAddress,
    type: 'multipleInput',
    show: false
  },
  {
    label: '主题',
    name: formDataField.subject,
    type: 'normalInput',
    show: true
  }
];

const dynamicOperateBtn = [
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
];


class EditMailPanel extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  getDefaultFromAddress(mailBoxList) {
    let fromAddress = '';
    if (mailBoxList && mailBoxList instanceof Array && mailBoxList.length > 0) {
      fromAddress = mailBoxList[0].recid;
    }
    return fromAddress;
  }

  constructor(props) {
    super(props);
    this.state = {
      formModel: this.props.editEmailPageFormModel === null ? formModel : this.props.editEmailPageFormModel,
      dynamicOperateBtn: this.props.editEmailPageBtn === null ? dynamicOperateBtn : this.props.editEmailPageBtn,
      fileList: [],
      uploadingFiles: [],
      fileUploadLimit: false,
      UMEditorContent: '',
      fromAddress: this.getDefaultFromAddress(this.props.mailBoxList),
      totalFileSize: 0,
      height: document.body.clientHeight - 60 - 10
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formModel: nextProps.editEmailPageFormModel === null ? formModel : nextProps.editEmailPageFormModel,
      dynamicOperateBtn: nextProps.editEmailPageBtn === null ? dynamicOperateBtn : nextProps.editEmailPageBtn
    });

    if (nextProps.type && nextProps.type !== this.props.type) {
      this.queryMailDetail(nextProps.mailId, nextProps.mailBoxList, nextProps.type);
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.queryMailDetail(this.props.mailId, this.props.type);
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize(e) {
    this.setState({
      height: document.body.clientHeight - 60 - 10
    });
    const formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);
    this.umEditor.setHeight(document.body.clientHeight - 60 - 10 - formModel.length * 44 - 205);
  }


  queryMailDetail(mailid, mailBoxList, editMailType) {
    if (mailid) {
      try {
        request('/api/mail/maildetail', {
          method: 'post', body: JSON.stringify({ mailid: mailid })
        }).then((result) => {
          const { data: { maildetail } } = result;
          this.umEditor.setContent(this.getInitMailContent(maildetail)); //设置初始富文本内容
          this.setFormData(maildetail, mailBoxList, editMailType);  //设置表单初始数据

          if (editMailType === 'replay-attach' || editMailType === 'replay-all-attach' || editMailType === 'send-attach') { //显示附件初始数据
            this.setState({
              fileList: maildetail.attachinfo && maildetail.attachinfo instanceof Array && maildetail.attachinfo.map((item) => {
                return {
                  fileid: item.fileid,
                  filename: item.filename,
                  filelength: 0
                };
              })
            });
          } else {
            this.setState({
              fileList: []
            });
          }
        });
      } catch (e) {
        console.error(e);
        message.error(e);
      }
    } else {
      this.umEditor.setContent(''); //写邮件  清空富文本内容
      this.setState({
        fileList: [],
        fromAddress: this.getDefaultFromAddress(mailBoxList)
      });
    }
  }


  transformFornEndData(data) {
    const returnData = data && data instanceof Array && data.map((item) => {
        return {
          email: item.address,
          name: item.displayname
        };
    });
    return returnData;
  }

  getMail(maildetail, mailBoxList, type) { //原邮件的收件人 抄送人 密送人是否跟 mailBoxList 数据有匹配
    let filterMailAddress = '';
    if (mailBoxList && mailBoxList instanceof Array) {
      for (let i = 0; i < mailBoxList.length; i++) {
        if (maildetail && maildetail.receivers && maildetail.receivers instanceof Array) {
          let stop = false;
          for (let j=0; j < maildetail.receivers.length; j++) {
            if (mailBoxList[i].accountid === maildetail.receivers[j].address) {
              filterMailAddress = maildetail.receivers[j].address;
              stop = true;
              break;
            }
          }

          if (stop) {
            break;
          }
        }


        if (maildetail && maildetail.ccers && maildetail.ccers instanceof Array) {
          let stop = false;
          for (let j=0; j < maildetail.ccers.length; j++) {
            if (mailBoxList[i].accountid === maildetail.ccers[j].address) {
              filterMailAddress = maildetail.ccers[j].address;
              stop = true;
              break;
            }
          }
          if (stop) {
            break;
          }
        }


        if (maildetail && maildetail.bccers && maildetail.bccers instanceof Array) {
          let stop = false;
          for (let j=0; j < maildetail.bccers.length; j++) {
            if (mailBoxList[i].accountid === maildetail.bccers[j].address) {
              filterMailAddress = maildetail.bccers[j].address;
              stop = true;
              break;
            }
          }
          if (stop) {
            break;
          }
        }
      }
    }

    let fromAddress = '';
    mailBoxList && mailBoxList instanceof Array && mailBoxList.map((item) => {
      if (item.accountid === filterMailAddress) {
        fromAddress = item.recid;
      }
    })


    this.setState({
      fromAddress: fromAddress
    });

    if (type === 'getReceivers') {
      const returnData = [...maildetail.receivers, maildetail.sender].filter((item) => {
        return item.address !== filterMailAddress;
      });
      return this.transformFornEndData(returnData);
    } else if (type === 'getCcers') {
      const returnData = maildetail && maildetail instanceof Array && maildetail.ccers.filter((item) => {
        return item.address !== filterMailAddress;
      });
      return this.transformFornEndData(returnData);
    }
  }

  setFormAddress(maildetail, mailBoxList) { //设置默认发件箱
    let fromAddress = '';

    mailBoxList && mailBoxList instanceof Array && mailBoxList.map((item) => {
      if (item.accountid === maildetail.sender.address) {
        fromAddress = item.recid;
      }
    });

    this.setState({
      fromAddress: fromAddress
    });
  }

  setFormData(maildetail, mailBoxList, editMailType) {
    const filteData = mailBoxList && mailBoxList instanceof Array && mailBoxList.filter((item) => {
      return item.accountid === maildetail.sender.address;
    });
    if (filteData && filteData instanceof Array && filteData.length > 0) { //发件箱 数据
      this.setFormAddress(maildetail, mailBoxList);
      if (editMailType === 'replay' || editMailType === 'replay-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: {
              [formDataField.subject]: 'Re：' + maildetail.title
            },
            editEmailPageBtn: null,
            editEmailPageFormModel: null
        } });
      } else if (editMailType === 'reply-all' || editMailType === 'replay-all-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: {
              [formDataField.ToAddress]: this.transformFornEndData(maildetail.receivers),
              [formDataField.CCAddress]: this.transformFornEndData(maildetail.ccers),
              [formDataField.subject]: 'Re：' + maildetail.title
            },
            editEmailPageBtn: [
              {
                label: '添加抄送',
                name: 'addCS',
                show: this.transformFornEndData(maildetail.ccers) ? false : true
              },
              {
                label: '删除抄送',
                name: 'delCS',
                show: this.transformFornEndData(maildetail.ccers) ? true : false
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
            editEmailPageFormModel: [
              {
                label: '收件人',
                name: formDataField.ToAddress,
                type: 'multipleInput',
                show: true
              },
              {
                label: '抄送',
                name: formDataField.CCAddress,
                type: 'multipleInput',
                show: this.transformFornEndData(maildetail.ccers) ? true : false
              },
              {
                label: '密送',
                name: formDataField.BCCAddress,
                type: 'multipleInput',
                show: false
              },
              {
                label: '主题',
                name: formDataField.subject,
                type: 'normalInput',
                show: true
              }
            ]
        } });
      } else if (editMailType === 'send' || editMailType === 'send-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: {
              [formDataField.subject]: 'Fw：' + maildetail.title
            },
            editEmailPageBtn: null,
            editEmailPageFormModel: null
        } });
      }
    } else { //收件箱 数据
      this.getMail(maildetail, mailBoxList); //设置默认发件箱
      if (editMailType === 'replay' || editMailType === 'replay-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: {
              [formDataField.ToAddress]: this.transformFornEndData(maildetail.sender),
              [formDataField.subject]: 'Re：' + maildetail.title
            },
            editEmailPageBtn: null,
            editEmailPageFormModel: null
          } });
      } else if (editMailType === 'reply-all' || editMailType === 'replay-all-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: {
              [formDataField.ToAddress]: this.getMail(maildetail, mailBoxList, 'getReceivers'),
              [formDataField.CCAddress]: this.getMail(maildetail, mailBoxList, 'getCcers'),
              [formDataField.subject]: 'Re：' + maildetail.title
            },
            editEmailPageBtn: [
              {
                label: '添加抄送',
                name: 'addCS',
                show: this.transformFornEndData(maildetail.ccers) ? false : true
              },
              {
                label: '删除抄送',
                name: 'delCS',
                show: this.transformFornEndData(maildetail.ccers) ? true : false
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
            editEmailPageFormModel: [
              {
                label: '收件人',
                name: formDataField.ToAddress,
                type: 'multipleInput',
                show: true
              },
              {
                label: '抄送',
                name: formDataField.CCAddress,
                type: 'multipleInput',
                show: this.transformFornEndData(maildetail.ccers) ? true : false
              },
              {
                label: '密送',
                name: formDataField.BCCAddress,
                type: 'multipleInput',
                show: false
              },
              {
                label: '主题',
                name: formDataField.subject,
                type: 'normalInput',
                show: true
              }
            ]
          } });
      } else if (editMailType === 'send' || editMailType === 'send-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: {
              [formDataField.subject]: 'Fw：' + maildetail.title
            },
            editEmailPageBtn: null,
            editEmailPageFormModel: null
          } });
      }
    }
  }


  getInitMailContent(mailDetailData) {
    let senttime = mailDetailData.senttime;
    let sender = mailDetailData.sender;
    let title = mailDetailData.title;
    let mailbody = mailDetailData.mailbody.replace(/body{/, '.edui-body-container{');
    let receivers = this.getTransformReceivers(mailDetailData.receivers);
    let ccers = this.getTransformReceivers(mailDetailData.ccers);

    let initHtmlString = '<br/><br/><br/><br/><br/><br/>' +
      '<div style="background: #f2f2f2; padding: 10px">' +
      '<h4><span style="font-size:12px"></span></h4>' +
      '<h4><span style="font-size:12px"></span></h4>' +
      '<h4 style="white-space: normal;">-------------------<span style="font-size:12px">原始邮件</span>-------------------</h4>' +
      '<h4><span style="font-size:12px"></span>' +
      '<span style="font-size:12px"><strong>发件人: </strong>&quot;' + sender.displayname + '&nbsp; &lt;' + sender.address + '&gt;&quot;;<br/></span>' +
      '<span style="font-size:12px"><strong>发送时间: </strong>' + senttime + '<br/></span>' +
      '<span style="font-size:12px"><strong>收件人: </strong>' + receivers + ';<br/></span>';

    if (ccers) {
      initHtmlString += '<span style="font-size:12px"><strong>抄送: </strong>&quot;' + ccers + ';<br/></span>';
    }
    initHtmlString += '<span style="font-size:12px"><strong>主题:</strong> ' + title + '</span><br/></h4></div>';

    initHtmlString += mailbody;
    return initHtmlString;
  }

  getTransformReceivers(data) {
    let returnString = '';
    data && data instanceof Array && data.map((item) => {
      returnString += '&quot;' + item.displayname + ' &nbsp; &lt;' + item.address + '&gt;&quot;';
    });

    return returnString;
  }


  umEditorRef = umEditor => {
    this.umEditor = umEditor;
    this.onUMEditorReady && this.onUMEditorReady();
  }

  closePanel() {
    this.props.dispatch({ type: 'mails/putState', payload: { showingModals: '' } });
  }

  changeFormModal(type) {
    let formModel = _.cloneDeep(this.state.formModel);
    let dynamicOperateBtn = _.cloneDeep(this.state.dynamicOperateBtn);
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

    const showFormModel = formModel && formModel instanceof Array && formModel.filter((item) => item.show);
    this.umEditor.setHeight(document.body.clientHeight - 60 - 10 - showFormModel.length * 44 - 205);

    this.props.dispatch({ type: 'mails/putState', payload: {
      editEmailPageFormModel: formModel,
      editEmailPageBtn: dynamicOperateBtn
    } });
  }

  sendMail() {
    const mailBoxList = this.props.mailBoxList; //发件人列表数据
    const formData = this.props.editEmailFormData;
    let formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);

    if (!formData || !formData.ToAddress || formData.ToAddress.length === 0) {
      message.warning('收件人不能为空');
      return false;
    }

    let submitData = {};
    formModel && formModel instanceof Array && formModel.map((item) => { //筛选出当前表单显示的数据
      submitData[item.name] = formData && formData[item.name];
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

    submitData.AttachmentFile = this.state.fileList.map((item) => {
      return {
        fileid: item.fileid, //附件人
        filetype: 1 //新文件
      };
    }); //附件数据
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
    if (file.type === 'application/x-msdownload') {
      message.error('抱歉，暂时不支持此类型的附件上传');
    }
    if (this.state.totalFileSize + file.size > 1024 * 1024 * 1024 * 4) { //1024 * 1024 * 1024 * 4
      message.error('文件大小不可超过4G');
      this.setState({
        fileUploadLimit: true
      });
    }
    return true;
  };

  handleUploadChange = ({ file, fileList }) => {
    //debugger;
    if (file.response && file.response.error_code === 0 && file.type !== 'application/x-msdownload' && !this.state.fileUploadLimit) {
      const fileId = file.response.data;
      // 上传成功，拿uuid
      this.setState({
        fileList: [
          ...this.state.fileList,
          {
            fileid: fileId,
            filename: file.name,
            filelength: file.size
          }
        ],
        uploadingFiles: [],
        totalFileSize: fileList.reduce((prev, cur) => cur.filelength + prev, 0)
      });
    }


    const uploadingFiles = fileList.filter(item => item.status !== 'done');
    this.setState({ uploadingFiles });
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

  getFileList = () => {
    const files = this.state.fileList;
    let completedFileList = [];
    if (files) {
      completedFileList = files.map(file => {
        return {
          uid: file.fileid,
          name: file.filename,
          status: 'done',
          url: `/api/fileservice/download?fileid=${file.fileid}`
        };
      });
    }
    const fileList = [...completedFileList, ...this.state.uploadingFiles];
    return fileList;
  };

  render() {
    const props = {
      name: 'data',
      data: this.getUploadParams,
      action: '/api/fileservice/upload',
      headers: {
        ...getDeviceHeaders(),
        Authorization: 'Bearer ' + this.props.token
      },
      beforeUpload: this.beforeUpload,
      onChange: this.handleUploadChange,
      fileList: this.getFileList()
    };

    const formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);
    const editMailType = this.props.type;
    let visible = false;
    if (editMailType === 'editMail' || editMailType === 'replay' || editMailType === 'replay-attach' || editMailType === 'reply-all' || editMailType === 'replay-all-attach' || editMailType === 'send' || editMailType === 'send-attach') {
      visible = true;
    }


    return (
      <div className={Styles.editMailWrap} style={{ width: 'calc(100% - 10px)', height: this.state.height, display: visible ? 'block' : 'none' }}>
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
            <UMEditor style={{ width: '100%', height: this.state.height - formModel.length * 44 - 205 }} useImageBase64 ref={this.umEditorRef} loading={false} onChange={this.UMEditorContentChangeHandler.bind(this)} />
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
