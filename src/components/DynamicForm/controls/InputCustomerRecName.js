import React, { Component } from 'react';
import { Modal, Button, Form, Input, Table, message } from 'antd';
import { searchcustomerrepeat } from '../../../services/datasource';
import styles from './InputCustomerRecName.less';

const entityInfo = {
  '046ed3f6-8c81-41ab-baff-339c339eddf5': {
    entityId: 'ac051b46-7a20-4848-9072-3b108f1de9b0',
    entityName: '客户',
    showQuote: true
  },
  'e61403f1-4511-49b9-a1c1-52a8cea855d1': {
    entityId: 'db330ae1-b78c-4e39-bbb5-cc3c4a0c2e3b',
    entityName: '销售线索',
    showQuote: false
  }
}

class InputCustomerRecName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: props.value,
      repeatCustomData: [],
      listHide: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ inputValue: nextProps.value });
    }
  }

  componentDidMount() {

  }

  onInputChange(event) {
    this.setState({ inputValue: event.target.value });
  }

  onInputBlur(event) {
    let val = event.target.value;
    this.props.onChange(val);
    //客户新增， 客户名称键入后，需要查重引用
    if (val == '') {
      return
    } else {
      searchcustomerrepeat({
        EntityId: this.getEntityInfo().entityId, //客户资料实体ID
        CheckName: val,
        Exact: 0,
        SearchData: {}
      }).then(result => {
        let repeatCustomData;
        repeatCustomData = result.data instanceof Array ? result.data : [];
        this.setState({
          repeatCustomData: repeatCustomData
        })
      }, err => {
        message.error(err.message || '请求失败');
      });
    }
  }

  getEntityInfo = () => {
    return entityInfo[this.props.fieldId] || {};
  };

  quoteCustomer(formData) {
    const _this = this;
    Modal.confirm({
      title: `是否引用${this.getEntityInfo().entityName}:${formData.recname}?`,
      content: '',
      onOk() {
        _this.props.quoteHandler && _this.props.quoteHandler(formData);
        _this.setState({
          listHide: true
        });
      },
      onCancel() {

      }
    });
  }

  render() {
    return (
      <div>
        <Input
          type={this.props.type}
          value={this.state.inputValue}
          onChange={this.onInputChange.bind(this)}
          onBlur={this.onInputBlur.bind(this)}
          disabled={this.props.isReadOnly === 1}
          maxLength={this.props.maxLength ? this.props.maxLength : 200}
        />
        <div style={{ display: this.state.listHide ? 'none' : 'block' }}>
          {this.state.repeatCustomData.length > 0 ? <div>系统已有相似{this.getEntityInfo().entityName}:</div> : ''}
          {
            this.state.repeatCustomData.map((item, index) => {
              return (
                <ul key={item.recid}>
                  <li>
                    <span className={styles.spanLeft} title={item.recname}>{item.recname}</span>
                    {this.getEntityInfo().showQuote && <span className={styles.spanRight} onClick={this.quoteCustomer.bind(this, item)}>引用</span>}
                  </li>
                </ul>
              )
            })
          }
        </div>
      </div>
    )
  }

}

InputCustomerRecName.propTypes = {
  quoteHandler: React.PropTypes.func.isRequired
}

InputCustomerRecName.defaultProps = {}


export default InputCustomerRecName;
