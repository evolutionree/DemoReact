/**
 * Created by 0291 on 2017/11/14.
 */
import React, { Component } from 'react';
import { Icon, Input } from 'antd';
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
      show: false,
      listData: []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
    this.queryListData(nextProps.value);
  }

  componentWillMount() {
    this.queryListData(this.state.value);
  }

  queryListData(value) {
    request('/api/mail/getcontactbykeyword', {
      method: 'post', body: JSON.stringify({ keyword: value })
    }).then((result) => {
      this.setState({
        listData: result && result.data
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
      value: '',
      show: false
    });
  }

  keyDownHandler(e) {
    if (e.keyCode === 8) {
      if (!e.target.value) {
        this.props.deleteData && this.props.deleteData();
        this.setState({
          show: false
        });
      }
    }
  }

  inputChangeHandler(e) {
    if ((e.target.value.toString().indexOf(';') > -1) || (e.target.value.toString().indexOf('；') > -1)) {
      this.props.completeInput && this.props.completeInput(this.getMatchAllContacts(this.state.value), 'change');
      this.setState({
        value: '',
        show: false
      });
    } else {
      this.queryListData(e.target.value);
      this.setState({
        value: e.target.value,
        show: true
      });
    }
  }

  focus() {
    this.InputSearchRef.focus();
    this.setState({
      show: true
    });
  }

  blur() {
    this.InputSearchRef.blur();
    this.setState({
      show: false
    });
  }

  inputClickHandler(e) {
    e.stopPropagation();
    this.props.onClick && this.props.onClick(e);
    this.setState({
      show: true
    });
  }

  selectItem(item, e) {
    e.stopPropagation();
    this.props.completeInput && this.props.completeInput({
      name: item.name,
      email: item.emailaddress
    }, 'select');
    this.setState({
      value: '',
      show: false
    });
    setTimeout(() => { //会触发blur事件  所以延时处理
      try {
        this.InputSearchRef.focus();
      } catch (e) {}
    }, 300);
  }

  render() {
    return (
      <div className={Styles.inputSearchWrap}>
        <Input ref={(ref) => this.InputSearchRef = ref}
               onBlur={this.completeInput.bind(this, 'blur')}
               onPressEnter={this.completeInput.bind(this, 'enter')}
               value={this.state.value}
               onKeyDown={this.keyDownHandler.bind(this)}
               onClick={this.inputClickHandler.bind(this)}
               onChange={this.inputChangeHandler.bind(this)} />
        <ul style={{ display: this.state.show ? 'block' : 'none' }}>
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
  }
)(InputSearch);
