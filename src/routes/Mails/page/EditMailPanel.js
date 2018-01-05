/**
 * Created by 0291 on 2017/11/6.
 * 收件箱
 * 原收件人回复  收件人为原发件人 抄送人/密送人为空
 * 原收件人回复全部  收件人为原发件人+原收件人列表-当前账号绑定的邮箱  抄送人还是原抄送人-当前账号绑定的邮箱 密送人为空
 * 原收件人转发  收件人/抄送人/密送人为空
 *
 * 发件箱
 * 原发件人回复  收件人/抄送人/密送人为空
 * 原发件人全部回复  收件人为原收件人 抄送人为原抄送人 密送人为空
 * 原发件人转发  收件人/抄送人/密送人为空
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
import {
  validsendmaildata,
  savedraft
} from '../../../services/mails';

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

const signReg = /(<h5\sid="sign">)[\s\S]*?(<\/h5>)/;

class EditMailPanel extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      formModel: this.props.editEmailPageFormModel === null ? formModel : this.props.editEmailPageFormModel,
      dynamicOperateBtn: this.props.editEmailPageBtn === null ? dynamicOperateBtn : this.props.editEmailPageBtn,
      fileList: [], //附件数据
      uploadingFiles: [], //上传中的附件数据
      fileUploadLimit: false, //当总文件大小超20M 则限制上传
      fileTypeUploadLimit: false, //当文件类型为.exe 则限制上传
      UMEditorContent: '', //富文本 内容
      fromAddress: this.getDefaultFromAddress(this.props.mailBoxList), //发件邮箱 发新邮件默认取列表第一个  回复、转发取收到邮件的邮箱
      height: document.body.clientHeight - 60 - 10,
      isSign: false, //是否 设置签名
      sendLoading: false, //发邮件状态  防止邮件发送重复提交
    };
  }

  getDefaultFromAddress(mailBoxList) {
    let fromAddress = '';
    if (mailBoxList && mailBoxList instanceof Array && mailBoxList.length > 0) {
      fromAddress = mailBoxList[0].recid;
    }
    return fromAddress;
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    if (this.refs.domListenRef) { //监听节点变化  动态计算编辑器的高度
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
      if (MutationObserver) {
        const observer = new MutationObserver(() => { //当页面发件人、密送人、抄送人输入框, 附件列表 DOM发生变化时  触发
          const listenDomHeight = this.refs.domListenRef.offsetHeight;
          if (listenDomHeight > 0) { //不清楚为什么最开始 会等于0
            this.umEditor.setHeight(document.body.clientHeight - 60 - 10 - listenDomHeight - 180);
          }
          setTimeout(() => { //不清楚为什么 当附件存在列表时 计算附件列表的高度存在误差（取不到附件列表高度）， 所以开个计时器处理
            const newListenDomHeight = this.refs.domListenRef.offsetHeight;
            if (newListenDomHeight !== listenDomHeight) {
              if (newListenDomHeight > 0) {
                this.umEditor.setHeight(document.body.clientHeight - 60 - 10 - newListenDomHeight - 180);
              }
            }
          }, 500);
        });
        //主要监听节点变化
        observer.observe(this.refs.domListenRef, { attributes: false, childList: true, subtree: true });
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formModel: nextProps.editEmailPageFormModel === null ? formModel : nextProps.editEmailPageFormModel,
      dynamicOperateBtn: nextProps.editEmailPageBtn === null ? dynamicOperateBtn : nextProps.editEmailPageBtn
    });

    if (nextProps.type && nextProps.type !== this.props.type) { // 打开页面
      this.queryMailDetail(nextProps.mailId, nextProps.mailBoxList, nextProps.type); //查询邮件数据 mailid 新邮件为‘’,  回复转发有Mailid
      this.setState({
        uploadingFiles: [],
        fileUploadLimit: false,
        fileTypeUploadLimit: false,
        isSign: false,
        sendLoading: false
      });
    }
  }

  onWindowResize(e) {
    this.setState({
      height: document.body.clientHeight - 60 - 10
    });
    const formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);
    try {
      const uploadListHeight = this.refs.uploadList.offsetHeight; //附件列表的高度
      this.umEditor.setHeight(document.body.clientHeight - 60 - 10 - formModel.length * 44 - uploadListHeight - 180);
    } catch (e) { }
  }


  queryMailDetail(mailid, mailBoxList, editMailType) {
    if (mailid) {
      try {
        request('/api/mail/maildetail', {
          method: 'post', body: JSON.stringify({ mailid: mailid })
        }).then((result) => {
          const { data: { maildetail } } = result;
          if (editMailType === 'draft') { //草稿箱
            this.setFormAddress(maildetail, mailBoxList);
            this.umEditor.setContent(maildetail.mailbody || ''); //设置初始富文本内容
            if (signReg.test(maildetail.mailbody)) {
              this.setState({
                isSign: true
              });
            }
            this.setDraftFormData(maildetail, mailBoxList);
          } else {
            this.umEditor.setContent(this.getInitMailContent(maildetail)); //设置初始富文本内容
            this.setFormData(maildetail, mailBoxList, editMailType);  //设置表单初始数据
          }


          if (editMailType === 'draft' || editMailType === 'replay-attach' || editMailType === 'replay-all-attach' || editMailType === 'send-attach') { //显示附件初始数据
            const fileList = maildetail.attachinfo && maildetail.attachinfo instanceof Array && maildetail.attachinfo.map((item) => {
                return {
                  fileid: item.fileid,
                  filename: item.filename,
                  size: item.filesize
                };
            });
            this.setState({
              fileList: fileList || []
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
      this.umEditor.setContent(''); //设置初始富文本内容
      this.setState({
        fileList: [],
        fromAddress: this.getDefaultFromAddress(mailBoxList)
      });
    }
  }

  setDraftFormData(maildetail, mailBoxList) {
    this.props.dispatch({ type: 'mails/putState',
      payload: {
        editEmailFormData: {
          [formDataField.ToAddress]: this.transformFornEndData(maildetail.receivers),
          [formDataField.CCAddress]: this.transformFornEndData(maildetail.ccers),
          [formDataField.BCCAddress]: this.transformFornEndData(maildetail.bccers),
          [formDataField.subject]: maildetail.title
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
            show: this.transformFornEndData(maildetail.bccers) ? false : true
          },
          {
            label: '删除密送',
            name: 'delMS',
            show: this.transformFornEndData(maildetail.bccers) ? true : false
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
            show: this.transformFornEndData(maildetail.bccers) ? true : false
          },
          {
            label: '主题',
            name: formDataField.subject,
            type: 'normalInput',
            show: true
          }
        ]
      } });
  }

  getInitMailContent(mailDetailData) {
    let sender = mailDetailData.sender;
    let senttime = mailDetailData.senttime;
    let title = mailDetailData.title;
    let mailbody = mailDetailData.mailbody && typeof mailDetailData.mailbody === 'string' && mailDetailData.mailbody.replace(/body{/, '.edui-body-container{'); // 解决 富文本里的样式 覆盖全局样式
    let receivers = this.getTransformReceivers(mailDetailData.receivers);
    let ccers = this.getTransformReceivers(mailDetailData.ccers);

    let initHtmlString = '<br/><br/><br/>' +
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

  setFormData(maildetail, mailBoxList, editMailType) {
    const filteData = mailBoxList && mailBoxList instanceof Array && mailBoxList.filter((item) => {
        return item.accountid === maildetail.sender.address;
    });

    if (filteData && filteData instanceof Array && filteData.length > 0) { //发件箱 数据
      this.setFormAddress(maildetail, mailBoxList);
      if (editMailType === 'replay' || editMailType === 'replay-attach') {
        this.props.dispatch({ type: 'mails/putState',
          payload: {
            editEmailFormData: { //发件人 抄送人 密送人 主题 form的数据
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
              [formDataField.ToAddress]: this.transformFornEndData([maildetail.sender]),
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


  transformFornEndData(data) {
    const returnData = data && data instanceof Array && data.map((item) => {
        return {
          email: item.address,
          name: item.displayname
        };
    });
    return returnData;
  }

  getMail(maildetail, mailBoxList, type) { //原邮件的收件人 抄送人 密送人是否跟 mailBoxList 数据有匹配 (maildetail 不会返回密送人信息)
    let filterMailAddress = '';
    if (mailBoxList && mailBoxList instanceof Array) {
      for (let i = 0; i < mailBoxList.length; i++) {
        if (maildetail && maildetail.receivers && maildetail.receivers instanceof Array) {
          let stop = false;
          for (let j = 0; j < maildetail.receivers.length; j++) {
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


        if (maildetail && maildetail.frommailaddress) {
          if (mailBoxList[i].accountid === maildetail.frommailaddress) {
            filterMailAddress = maildetail.frommailaddress;
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
      const returnData = maildetail && maildetail.ccers && maildetail.ccers instanceof Array && maildetail.ccers.filter((item) => {
        return item.address !== filterMailAddress;
      });
      return this.transformFornEndData(returnData);
    }
  }

  closePanel() {
    if (this.state.uploadingFiles.length > 0) {
      confirm({
        title: '还有附件未上传完成',
        content: '您确定关闭？',
        onOk: () => {
          this.setState({
            fileList: [],
            uploadingFiles: []
          })
          this.props.dispatch({ type: 'mails/putState', payload: { showingPanel: '' } });
          this.props.dispatch({ type: 'mails/reloadCatalogTree' });
          this.props.dispatch({ type: 'mails/queryMailList' });
        },
        onCancel() {

        }
      });
    } else {
      this.props.dispatch({ type: 'mails/putState', payload: { showingPanel: '' } });
      this.props.dispatch({ type: 'mails/reloadCatalogTree' });
      this.props.dispatch({ type: 'mails/queryMailList' });
    }
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


    this.props.dispatch({ type: 'mails/putState', payload: {
      editEmailPageFormModel: formModel,
      editEmailPageBtn: dynamicOperateBtn
    } });
  }

  sendMail() {
    const mailBoxList = this.props.mailBoxList; //发件人列表数据
    const formData = this.props.editEmailFormData;
    let formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);

    let submitData = {};
    formModel && formModel instanceof Array && formModel.map((item) => { //筛选出当前表单显示的数据
      submitData[item.name] = formData && formData[item.name];
    });

    for (let key in formDataField) { //抄送 密送没值得时候 传[]
      if (key !== formDataField.subject) {
        submitData[key] = submitData[key] ? submitData[key] : [];
      }
    }

    if (submitData[formDataField.ToAddress].length === 0 && submitData[formDataField.CCAddress].length === 0 && submitData[formDataField.BCCAddress].length === 0) {
      message.warning('收件人、抄送、密送不能都为空');
      return false;
    }

    for (let key in submitData) {
      if (key !== formDataField.subject) {
        if (getTransformAddress(submitData[key])) {
          submitData[key] = getTransformAddress(submitData[key]);  //转换成后端要求的格式
        } else {
          const info = {
            [formDataField.ToAddress] : '收件人',
            [formDataField.CCAddress] : '抄送人',
            [formDataField.BCCAddress] : '密送人'
          }
          message.warning(info[key] + '邮箱格式存在错误,请修正后再发送');
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

    submitData.AttachmentFile = this.state.fileList && this.state.fileList instanceof Array && this.state.fileList.map((item) => {
      return {
        fileid: item.fileid, //附件人
        filetype: 1 //新文件
      };
    }); //附件数据

    submitData.AttachmentFile = submitData.AttachmentFile || [];
    submitData.bodycontent = this.state.UMEditorContent; //富文本框数据

    if (!submitData.subject && submitData.subject !== 0) {
      confirm({
        title: '您的邮件没有填写主题',
        content: '您确定继续发送？',
        onOk: () => {
          this.okSend(submitData);
        },
        onCancel() {

        }
      });
    } else {
      this.okSend(submitData);
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

  okSend(submitData) {
    this.setState({
      sendLoading: true
    });
    validsendmaildata(submitData).then((result) => { //校验发送邮件白名单
      this.setState({
        sendLoading: false
      });
      const { data } = result;
      if (data.flag === 0) {
        confirm({
          title: '确定继续发送吗?',
          content: data.tipmsg,
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            this.props.dispatch({ type: 'mails/sendemail', payload: submitData });
          },
          onCancel: () => {

          }
        });
      } else if (data.flag === 1) { //校验通过  邮件发送成功
        this.props.dispatch({ type: 'mails/putState', payload: { showingPanel: 'sendMailSuccess', editEmailPageFormModel: null, editEmailPageBtn: null, editEmailFormData: null } });
        this.props.dispatch({ type: 'mails/reloadCatalogTree' });
      }
    }).catch((reson) => {
      message.error(reson.message);
      this.setState({
        sendLoading: false
      });
    });
  }

  saveDraft() {
    const submitData = this.getSubmitData();
    if (this.props.currentMailId) {
      submitData.mailId = this.props.currentMailId;
    }
    savedraft(submitData).then((result) => { //保存草稿箱
      message.success('草稿保存成功');
      const { data } = result;
      if (!this.props.currentMailId) { //新增页面 保存草稿箱后要更新当前邮件Id  下次保存草稿就是更新数据
        this.props.dispatch({ type: 'mails/putState', payload: { currentMailId: data } });
      }
    }).catch((reson) => {
      message.error(reson.message);
    });
  }

  getSubmitData() { //发送邮件不用此函数（有很多验证逻辑）
    const mailBoxList = this.props.mailBoxList; //发件人列表数据
    const formData = this.props.editEmailFormData;
    let formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);

    let submitData = {};
    formModel && formModel instanceof Array && formModel.map((item) => { //筛选出当前表单显示的数据
      submitData[item.name] = formData && formData[item.name];
    });

    for (let key in formDataField) { //抄送 密送没值得时候 传[]
      if (key !== formDataField.subject) {
        submitData[key] = submitData[key] ? submitData[key] : [];
      }
    }


    for (let key in submitData) {
      if (key !== formDataField.subject) { //跟发送邮件不同  不用验证邮箱格式
        submitData[key] = getTransformAddress(submitData[key]);  //转换成后端要求的格式
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

    submitData.AttachmentFile = this.state.fileList && this.state.fileList instanceof Array && this.state.fileList.map((item) => {
        return {
          fileid: item.fileid, //附件人
          filetype: 1 //新文件
        };
      }); //附件数据

    submitData.AttachmentFile = submitData.AttachmentFile || [];
    submitData.bodycontent = this.state.UMEditorContent; //富文本框数据

    function getTransformAddress(data) {
      let returnData = [];
      if (data && data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
          returnData.push({
            address: data[i].email,
            displayname: data[i].name
          });
        }
      }
      return returnData;
    }

    return submitData;
  }

  UMEditorContentChangeHandler(content) {
    this.setState({
      UMEditorContent: content
    });
  }

  beforeUpload = (file) => {
    if (file.type === 'application/x-msdownload') {
      message.error('抱歉，暂时不支持此类型的附件上传');
      this.setState({
        fileTypeUploadLimit: true
      });
    } else {
      this.setState({
        fileTypeUploadLimit: false
      });
    }
    if (this.state.fileList.reduce((prev, cur) => cur.size + prev, 0) + file.size > 1024 * 1024 * 20) { //1024 * 1024 * 1024 * 1
      message.error('文件大小不可超过20M');
      this.setState({
        fileUploadLimit: true
      });
    } else {
      this.setState({
        fileUploadLimit: false
      });
    }
    return true;
  };

  handleUploadChange = ({ file, fileList, event }) => {
    //debugger;
    if (file.response && file.response.error_code === 0 && !this.state.fileUploadLimit && !this.state.fileTypeUploadLimit) {
      const fileId = file.response.data;

      // 上传成功，拿uuid
      this.setState({
        fileList: [
          ...this.state.fileList,
          {
            fileid: fileId,
            filename: file.name,
            size: file.size
          }
        ],
        uploadingFiles: []
      });
    } else if (file.status === "removed") { //移除附件
      this.setState({
        fileList: this.state.fileList.filter((item) => {
          return item.fileid !== file.uid;
        })
      });
    }

    const uploadingFiles = fileList.filter(item => item.status !== 'done');
    this.setState({ uploadingFiles });
  };


  fromAddressSelectHandler(value) { //更新发送人
    if (this.state.isSign) {
      this.setSign(value);
    }
    this.setState({
      fromAddress: value
    });
  }

  changeSign(e) {
    if (e.target.checked) {
      this.setSign(this.state.fromAddress);
    } else {
      if (signReg.test(this.state.UMEditorContent)) {
        this.umEditor.setContent(this.state.UMEditorContent.replace(signReg, '<span></span>')); //取消签名
      }
    }
    this.setState({
      isSign: e.target.checked
    });
  }

  setSign(fromAddress) {
    let signString = '';
    const mailBoxList = this.props.mailBoxList;
    if (mailBoxList && mailBoxList instanceof Array) {
      for (let i = 0; i < mailBoxList.length; i++) {
        if (fromAddress === mailBoxList[i].recid) {
          signString = mailBoxList[i].signature;
        }
      }
    }

    signString = signString ? signString : '';
    if (signReg.test(this.state.UMEditorContent)) {
      this.umEditor.setContent(this.state.UMEditorContent.replace(signReg, '$1 ----------------<br />' + signString + ' $2')); //设置签名
    } else {
      this.umEditor.execCommand('inserthtml', '<br/><br/><br/><br/><h5 id="sign">----------------<br />' + signString + '</h5><br/>'); //设置初始富文本内容
    }
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
          size: file.size,
          url: `/api/fileservice/download?fileid=${file.fileid}`
        };
      });
    }
    const fileList = [...completedFileList, ...this.state.uploadingFiles];
    return fileList;
  };

  umEditorRef = umEditor => {
    this.umEditor = umEditor;
    this.onUMEditorReady && this.onUMEditorReady();
  }

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
    if (editMailType === 'editMail' || editMailType === 'draft' || editMailType === 'replay' || editMailType === 'replay-attach' || editMailType === 'reply-all' || editMailType === 'replay-all-attach' || editMailType === 'send' || editMailType === 'send-attach') {
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
              <Button onClick={this.sendMail.bind(this)} loading={this.state.sendLoading}>发送</Button>
              <Button onClick={this.saveDraft.bind(this)}>存草稿</Button>
              <Button className="grayBtn" onClick={this.closePanel.bind(this)}>关闭</Button>
              {
                this.state.dynamicOperateBtn && this.state.dynamicOperateBtn instanceof Array && this.state.dynamicOperateBtn.map((item, index) => {
                  if (item.show) {
                    return <Button key={index} ghost onClick={this.changeFormModal.bind(this, item.name)}>{item.label}</Button>;
                  }
                })
              }
            </Toolbar>
          </div>
          <div ref='domListenRef'>
            <Form model={formModel} ref={ref => this.FormRef = ref} />
            <div ref='uploadList'>
              <Upload {...props}>
                <div className={Styles.attachmentWrap}>
                  <Icon type="link" /><span>添加附件</span>
                </div>
              </Upload>
            </div>
          </div>
          <div className={Styles.UMEditorWrap}>
            <UMEditor style={{ width: '100%', height: this.state.height - formModel.length * 44 - 215 }} useImageBase64 ref={this.umEditorRef} loading={false} onChange={this.UMEditorContentChangeHandler.bind(this)} />
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
                <Checkbox onChange={this.changeSign.bind(this)} checked={this.state.isSign}>带签名</Checkbox>
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
