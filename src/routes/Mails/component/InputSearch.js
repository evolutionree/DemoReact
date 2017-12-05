/**
 * Created by 0291 on 2017/11/14.
 */
import React, { Component } from 'react';
import { Input } from 'antd';
import { connect } from 'dva';
import Styles from './InputSearch.less';
import request from '../../../utils/request';

class InputSearch extends Component {
  static propTypes = {
    value: React.PropTypes.string
  };
  static defaultProps = {
    value: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      listData: []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    if (nextProps.value !== this.state.value) {
      this.queryListData(nextProps.value);
    }
  }

  componentWillMount() {
    this.queryListData(this.state.value);
  }

  queryListData(value) {
    Promise.all([
      request('/api/mail/getcontactbykeyword', {
        method: 'post', body: JSON.stringify({ keyword: value, count: 50 })
      }),
      request('/api/mail/getinnerpersoncontact', {
        method: 'post', body: JSON.stringify({ keyword: value, PageIndex: 1, pageSize: 50 })
      })
    ]).then((result) => {
      const [customContact, innerContact] = result;
      const innerContactData = innerContact.data.datalist.map((item) => {
        return {
          name: item.treename,
          emailaddress: item.mail
        };
      });
      this.setState({
        listData: [
          ...customContact.data,
          ...innerContactData
        ]
      });
    });
  }


  getMatchAllContacts(value) {
    const mailContacts = this.props.mailContacts;
    let returnMailObj = {
      name: '',
      email: value
    };
    if (mailContacts && mailContacts instanceof Array) {
      for (let i = 0; i < mailContacts.length; i++) {
        if (mailContacts[i].emailaddress === value) {
          returnMailObj = mailContacts[i];
          break;
        }
      }
    }
    return returnMailObj;
  }

  completeInput(type) {
    this.props.completeInput && this.props.completeInput(this.getMatchAllContacts(this.state.value), type);
    this.setState({
      value: ''
    });
  }

  keyDownHandler(e) {
    if (e.keyCode === 8) {
      if (!e.target.value) {
        this.props.deleteData && this.props.deleteData();
      }
    }
  }

  inputChangeHandler(e) {
    if ((e.target.value.toString().indexOf(';') > -1) || (e.target.value.toString().indexOf('；') > -1)) {
      this.props.completeInput && this.props.completeInput(this.getMatchAllContacts(this.state.value), 'change');
      this.setState({
        value: ''
      });
    } else {
      this.queryListData(e.target.value);
      this.setState({
        value: e.target.value
      });
    }
  }

  focus() {
    this.InputSearchRef.focus();
  }

  blur() {
    this.InputSearchRef.blur();
  }

  inputClickHandler(e) {
    e.stopPropagation();
    this.props.onClick && this.props.onClick(e);
  }

  selectItem(item, e) {
    e.stopPropagation();
    this.props.completeInput && this.props.completeInput({
      name: item.name,
      email: item.emailaddress
    }, 'select');
    this.setState({
      value: ''
    });
    setTimeout(() => { //会触发blur事件  所以延时处理
      try {
        this.InputSearchRef.focus();
      } catch (e) {}
    }, 300);
  }

  focusHandler() {
    this.props.onFocus && this.props.onFocus();
  }

  render() {
    return (
      <div className={Styles.inputSearchWrap}>
        <Input ref={(ref) => this.InputSearchRef = ref}
               onBlur={this.completeInput.bind(this, 'blur')}
               onFocus={this.focusHandler.bind(this)}
               onPressEnter={this.completeInput.bind(this, 'enter')}
               value={this.state.value}
               onKeyDown={this.keyDownHandler.bind(this)}
               onClick={this.inputClickHandler.bind(this)}
               onChange={this.inputChangeHandler.bind(this)} />
        <ul style={{ display: this.state.value ? 'block' : 'none' }}>
          {
            this.state.listData && this.state.listData instanceof Array && this.state.listData.map((item, index) => {
              return (
                <li key={index} onMouseDown={this.selectItem.bind(this, item)} title={`${item.emailaddress}`}>
                  <span>{item.name}</span>  <span style={{ color: '#999' }}>{`<${item.emailaddress}>`}</span>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}


export default connect(
  state => {
    return { ...state.mails };
  },
  dispatch => {
    return {
      dispatch
    };
  },
  undefined,
  { withRef: true }
)(InputSearch);
