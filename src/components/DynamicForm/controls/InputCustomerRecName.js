import React, { Component } from 'react';
import { is } from 'immutable';
import _ from 'lodash';
import { Modal, Input, message } from 'antd';
import { queryEntityDetail } from '../../../services/entity';
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
};

class InputCustomerRecName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: props.value,
      repeatCustomData: [],
      listHide: true,
      setreference: '0' // 0 启用
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.querycustomerrepeat = _.debounce(this.querycustomerrepeat, 500);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ inputValue: nextProps.value });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  componentDidMount() {
    document.body.addEventListener('click', this.clickOutsideClose, false);
    this.getEntityDetail();
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
  }

  getEntityDetail = () => {
    const { entityId } = this.props;
    if (entityId) {
      queryEntityDetail(entityId).then(res => {
        const { data } = res;
        if (typeof data === 'object' && Array.isArray(data.entityproinfo) && data.entityproinfo.length && data.entityproinfo[0].servicesjson) {
          const servicesjson = data.entityproinfo[0].servicesjson;
          const setreference = servicesjson.entityConfig && JSON.parse(servicesjson.entityConfig).DisableRef;
          this.setState({ setreference });
        }
      });
    }
  }

  clickOutsideClose = (event) => {
    if ($(event.target).closest('#InputCustomerRecNameWrap').length) {
      return;
    }
    this.setState({
      listHide: true
    });
  };

  onInputChange = (event) => {
    this.setState({ inputValue: event.target.value, listHide: false });
    this.querycustomerrepeat(event.target.value);
  }

  onInputFocus = () => {
    this.setState({
      listHide: false
    });
  }

  onInputBlur = () => {

  }

  querycustomerrepeat = (val) => {
    this.props.onChange(val);
    //客户新增， 客户名称键入后，需要查重引用
    if (val !== '') {
      searchcustomerrepeat({
        EntityId: this.getEntityInfo().entityId, //客户资料实体ID
        CheckName: val,
        Exact: 0,
        SearchData: {}
      }).then(result => {
        const repeatCustomData = result.data instanceof Array ? result.data : [];
        this.setState({ repeatCustomData });
      }, err => {
        message.error(err.message || '请求失败');
      });
    }
  }

  getEntityInfo = () => {
    const { entityId } = this.props;
    return {
      entityId,
      entityName: '客户',
      showQuote: true
    };
    // return entityInfo[this.props.fieldId] || {};
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

  setInput = (text) => {

  }

  render() {
    const { setreference } = this.state;
    const listHide = this.state.listHide || this.state.repeatCustomData.length === 0;
    return (
      <div className={styles.InputCustomerRecNameWrap} id="InputCustomerRecNameWrap">
        <Input
          type={this.props.type}
          value={this.state.inputValue}
          onChange={this.onInputChange}
          onFocus={this.onInputFocus}
          onBlur={this.onInputBlur.bind(this)}
          disabled={this.props.isReadOnly === 1}
          maxLength={this.props.maxLength ? this.props.maxLength : '200'}
          style={{ height: '32px' }}
        />
        <div style={{ display: listHide ? 'none' : 'block' }} className={styles.listWrap}>
          {this.state.repeatCustomData.length > 0 ? <div>系统已有相似{this.getEntityInfo().entityName}:</div> : ''}
          {
            this.state.repeatCustomData.map((item, index) => {
              return (
                <ul key={item.recid}>
                  <li>
                    <span className={styles.spanLeft} title={item.recname}>{item.recname}</span>
                    {this.getEntityInfo().showQuote && setreference === '1' && <span className={styles.spanRight} onClick={this.quoteCustomer.bind(this, item)}>引用</span>}
                  </li>
                </ul>
              );
            })
          }
        </div>
      </div>
    );
  }

}

InputCustomerRecName.propTypes = {
  quoteHandler: React.PropTypes.func.isRequired
};

InputCustomerRecName.defaultProps = {};


export default InputCustomerRecName;
