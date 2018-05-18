/**
 * Created by 0291 on 2018/5/15.
 */
import React from 'react';
import { connect } from 'dva';
import { Checkbox, Input, Button, InputNumber, message } from 'antd';
import Page from '../../../components/Page';
import Styles from './index.less';
import _ from 'lodash';
const CheckboxGroup = Checkbox.Group;

const allOptionValue = ['issetpwdlength', 'isnumber', 'isupper', 'isspecialstr', 'islikeletter', 'iscontainaccount', 'isfirstupdatepwd', 'ispwdexpiry', 'iscueuserdate', 'ishistorypwd'];
const hasInputOption = ['setpwdlength', 'likeletter', 'pwdexpiry', 'cueuserdate', 'historypwd']; //UI中存在Input的CheckBox项

class PasswordStrategy extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      checkedList: this.getCheckedList(this.props.pwdpolicyData),

      isuserpolicy: this.props.pwdpolicyData.isuserpolicy,
      setpwdlength: this.props.pwdpolicyData.setpwdlength || '',
      likeletter: this.props.pwdpolicyData.likeletter || '',
      pwdexpiry: this.props.pwdpolicyData.pwdexpiry || '',
      cueuserdate: this.props.pwdpolicyData.cueuserdate || '',
      historypwd: this.props.pwdpolicyData.historypwd || ''
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      checkedList: this.getCheckedList(nextProps.pwdpolicyData),
      isuserpolicy: nextProps.pwdpolicyData.isuserpolicy,
      setpwdlength: nextProps.pwdpolicyData.setpwdlength || '',
      likeletter: nextProps.pwdpolicyData.likeletter || '',
      pwdexpiry: nextProps.pwdpolicyData.pwdexpiry || '',
      cueuserdate: nextProps.pwdpolicyData.cueuserdate || '',
      historypwd: this.props.pwdpolicyData.historypwd || ''
    });
  }

  getCheckedList = (pwdpolicyData) => {
    let checkedList = [];
    for (let i = 0; i < allOptionValue.length; i++) {
      if (pwdpolicyData[allOptionValue[i]] === 1) {
        checkedList.push(allOptionValue[i]);
      }
    }
    return checkedList;
  }

  onChange = (checkedList) => {
    for (let i = 0; i < hasInputOption.length; i++) { //如果用户取消勾选这项  后面的Input的数据清空
      if (checkedList.indexOf('is' + hasInputOption[i]) === -1) {
        this.setState({
          [hasInputOption[i]]: ''
        });
      } else {
        this.setState({
          [hasInputOption[i]]: hasInputOption[i] === 'setpwdlength' ? 3 : 1
        });
      }
    }
    this.setState({
      checkedList
    });
  }

  onStartChange = (e) => { //取消、启用密码策略配置
    this.setState({
      isuserpolicy: e.target.checked
    });
  }

  InputChange = (type, value) => {
    let newCheckList = _.cloneDeep(this.state.checkedList)
    if (value && this.state.checkedList.indexOf('is' + type) === -1) { //INput中有值  则设定该项CheckBox勾选
      newCheckList.push('is' + type);
    } else if (!value) {
      newCheckList = newCheckList.filter(item => item !== ('is' + type));
    }

    this.setState({
      [type]: value && parseInt(value),
      checkedList: newCheckList
    });
  }

  InputBlue = () => {
    if (parseInt(this.state.setpwdlength) < 3) {
      this.setState({
        setpwdlength: 3
      });
      return message.error('密码长度不能小于3');
    }
  }


  savepwdpolicy = () => {
    let checkedList = this.state.checkedList;
    let submitData = {
      isuserpolicy: this.state.isuserpolicy ? 1 : 0
    };
    for (let i = 0; i < hasInputOption.length; i++) {
      if (checkedList.indexOf('is' + hasInputOption[i]) > -1) {
        if (!this.state[hasInputOption[i]]) {
          checkedList = checkedList.filter(item => item !== ('is' + hasInputOption[i]));  //过滤掉输入框没填值得项
        }
      }
    }

    for (let i = 0; i < allOptionValue.length; i++) {
      if (checkedList.indexOf(allOptionValue[i]) > -1) {
        submitData[allOptionValue[i]] = 1;
      } else {
        submitData[allOptionValue[i]] = 0;
      }
    }

    for(let i = 0; i < hasInputOption.length; i++) {
      if (this.state[hasInputOption[i]]) {
        submitData[hasInputOption[i]] = this.state[hasInputOption[i]];
      }
    }
    this.props.dispatch({ type: 'passwordstrategy/save', payload: submitData });
  }

  render() { //IsUserPolicy
    const options = [
      { label: <label><span>至少包含</span><InputNumber onChange={this.InputChange.bind(this, 'setpwdlength')} value={this.state.setpwdlength} onBlur={this.InputBlue} /><span>个字母</span></label>, value: 'issetpwdlength' },
      { label: '数字', value: 'isnumber' },
      { label: '大小写', value: 'isupper' },
      { label: '特殊字符', value: 'isspecialstr' },
      { label: <label><span>不得连续多于</span><InputNumber min={0} step={1} onChange={this.InputChange.bind(this, 'likeletter')} value={this.state.likeletter} /><span>位相同的字母</span></label>, value: 'islikeletter' },
      { label: '不得包含用户名', value: 'iscontainaccount' },
      { label: '首次必须修改密码', value: 'isfirstupdatepwd' },
      { label: <label>密码有效期<InputNumber min={0} step={1} onChange={this.InputChange.bind(this, 'pwdexpiry')} value={this.state.pwdexpiry} />天</label>, value: 'ispwdexpiry' },
      { label: <label>提前<InputNumber min={0} step={1} onChange={this.InputChange.bind(this, 'cueuserdate')} value={this.state.cueuserdate} />天提示用户</label>, value: 'iscueuserdate' },
      { label: <label>不能与最近<InputNumber min={0} step={1} onChange={this.InputChange.bind(this, 'historypwd')} value={this.state.historypwd} />次密码相同</label>, value: 'ishistorypwd' }
    ];
    return (
      <div className={Styles.passwordStrategyWrap}>
        <Page title="密码策略配置" contentStyle={{ minHeight: '600px', position: 'relative' }}>
          <div style={{ borderBottom: '1px solid #E9E9E9', paddingBottom: '10px' }}>
            <Checkbox
              onChange={this.onStartChange}
              checked={this.state.isuserpolicy}
            >
              启用密码策略
            </Checkbox>
          </div>
          <br />
          <div style={{ paddingLeft: '22px' }}>
            {
              this.state.isuserpolicy ? (
                <CheckboxGroup options={options} value={this.state.checkedList} onChange={this.onChange} />
              ) : null
            }
            <Button style={{ marginTop: '20px' }} onClick={this.savepwdpolicy}>保存</Button>
          </div>
        </Page>
      </div>
    );
  }
}

export default connect(
  state => state.passwordstrategy,
  dispatch => {
    return {
      dispatch
    };
  }
)(PasswordStrategy);
