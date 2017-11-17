/**
 * Created by 0291 on 2017/11/6.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Input, Icon, Upload, message, Checkbox, Select } from 'antd';
import request, { getDeviceHeaders } from '../../../utils/request';
import Toolbar from '../../../components/Toolbar';
import Styles from './EditMailPanel.less';
import UMEditor from '../../../components/UMEditor';
import Form from '../component/Form';
import AddressList from '../component/AddressList';
import _ from 'lodash';
import {
  sendemail
} from '../../../services/mails';

const parseValue = (value) => {
  if (!value) return [];

  if (typeof value === 'string') {
    let files = [];
    try {
      files = JSON.parse(value);
      return files;
    } catch (e) {
      console.error('附件value格式出错');
      return files;
    }
  } else {
    return value;
  }
};

class EditMailPanel extends Component {
  static propTypes = {

  };
  static defaultProps = {
    visible: false
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
          name: 'MCAddress',
          type: 'multipleInput',
          show: false
        },
        {
          label: '分送给',
          name: 'fs',
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
        },
        {
          label: '分别发送',
          name: 'separateDelivery',
          show: true
        },
        {
          label: '取消分别发送',
          name: 'cancelSeparateDelivery',
          show: false
        }

      ],
      UMEditorContent: 'aaa',
      fromAddress: this.getFromAddress(this.props.mailBoxList)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fromAddress: this.getFromAddress(nextProps.mailBoxList)
    });
  }

  componentDidMount() {
   this.umEditor.setContent(this.state.UMEditorContent);
  }

  componentDidUpdate() {

  }

  getFromAddress(mailBoxList) {
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
    this.props.closePanel && this.props.closePanel();
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
      case 'separateDelivery':
        dynamicOperateBtn[0].show = false;
        dynamicOperateBtn[1].show = false;
        dynamicOperateBtn[2].show = false;
        dynamicOperateBtn[3].show = false;
        dynamicOperateBtn[4].show = false;
        dynamicOperateBtn[5].show = true;
        formModel[0].show = false;
        formModel[1].show = false;
        formModel[2].show = false;
        formModel[3].show = true;
        break;
      case 'cancelSeparateDelivery':
        dynamicOperateBtn[0].show = true;
        dynamicOperateBtn[1].show = false;
        dynamicOperateBtn[2].show = true;
        dynamicOperateBtn[3].show = false;
        dynamicOperateBtn[4].show = true;
        dynamicOperateBtn[5].show = false;
        formModel[0].show = true;
        formModel[1].show = false;
        formModel[2].show = false;
        formModel[3].show = false;
        break;
    }
    this.setState({
      formModel: formModel,
      dynamicOperateBtn: dynamicOperateBtn
    });
  }

  sendMail() {
    const mailBoxList = this.props.mailBoxList;
    const formData = _.cloneDeep(this.FormRef.getData());
    console.log(this.FormRef.getData());

    for (let key in formData) {
      if (key !== 'subject') {
        formData[key] = getAddress(formData[key]);
      }
    }


    if (mailBoxList && mailBoxList instanceof Array) {
      for (let i = 0; i < mailBoxList.length; i++) {
        if (mailBoxList[i].recid === this.state.fromAddress) {
          // formData.fromaddress = mailBoxList[i].accountid;
          // formData.fromname = mailBoxList[i].recname;
          formData.fromaddress = 'yjytest8@customer.local';
          formData.fromname = '销售1';
          break;
        }
      }
    }

    formData.bodycontent = this.state.UMEditorContent;
    sendemail(formData).then(result => {
      message.success('发送成功');
    }).catch(e => {
      message.error(e.message || '新增失败');
      this.setState({ confirmLoading: false });
    });

    console.log(JSON.stringify(formData));

    function getAddress(data) {
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
  }

  UMEditorContentChangeHandler(content) {
    console.log(content)
    this.setState({
      UMEditorContent: content
    });
  }


  beforeUpload = file => {
    if (file.size > 1024 * 1024 * 1024 * 4) {
      message.error('文件大小不可超过4G');
      return false;
    }
    return true;
  };

  handleUploadChange = ({ file, fileList }) => {

  };

  handleRemove = file => {

  };

  fromAddressSelectHandler(value) {
    this.setState({
      fromAddress: value
    });
  }

  render() {
    const props = {
      name: 'data',
      action: '/api/fileservice/upload',
      headers: {
        ...getDeviceHeaders(),
        Authorization: 'Bearer ' + this.props.token
      },
      beforeUpload: this.beforeUpload,
      onChange: this.handleUploadChange,
      onRemove: this.handleRemove
    };

    const formModel = this.state.formModel && this.state.formModel instanceof Array && this.state.formModel.filter((item) => item.show);

    return (
      <div className={Styles.editMailWrap} style={{ width: 'calc(100% - 10px)', height: 'calc(100% - 10px)', display: this.props.visible ? 'block' : 'none' }}>
        <div className={Styles.head}>
          新邮件
        </div>
        <div style={{ width: 'calc(100% - 220px)', float: 'left' }}>
          <div>
            <Toolbar style={{ paddingTop: '10px', paddingLeft: '10px' }}>
              <Button onClick={this.sendMail.bind(this)}>发送</Button>
              <Button className="grayBtn">存草稿</Button>
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
              <Button>发送</Button>
              <Button className="grayBtn">存草稿</Button>
              <Button className="grayBtn" onClick={this.closePanel.bind(this)}>取消</Button>
            </Toolbar>
          </div>
        </div>
        <div style={{ width: 220, float: 'left', height: 'calc(100% - 42px)' }}>
          <AddressList />
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

    };
  }
)(EditMailPanel);
