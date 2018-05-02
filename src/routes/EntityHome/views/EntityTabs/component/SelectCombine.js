/**
 * Created by 0291 on 2018/4/27.
 */
import React from 'react';
import { Input, Select, message, Icon } from 'antd';
import { connect } from 'dva';
import { getrelconfigfields } from '../../../../../services/entity';

const Option = Select.Option;

class SelectCombine extends React.Component {
  static propTypes = {

  };

  constructor(props) {
    super(props);
    this.state = {
      fields: []
    };
  }

  componentWillMount() {
    const itemValue = this.props.value;
    this.fetchRelconfigfields(itemValue.relentityid);
  }

  componentWillReceiveProps(nextProps) {
    const itemValue = nextProps.value;
    this.fetchRelconfigfields(itemValue.relentityid);
  }

  fetchRelconfigfields = (relentityid) => {
    if (relentityid) {
      getrelconfigfields(relentityid)
        .then(result => {
          this.setState({
            fields: result.data
          });
        })
        .catch(e => {
          console.error(e.message);
          message.error(e.message);
        });
    }
  }


  selectChange = (key, value) => {
    if (key === 'relentityid') {
      this.fetchRelconfigfields(value);
      this.props.onChange && this.props.onChange({
        ...this.props.value,
        [key]: value,
        fieldid: ''
      });
    } else {
      this.props.onChange && this.props.onChange({
        ...this.props.value,
        [key]: value
      });
    }
  }

  inputChange = (e) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      func: e.target.value
    });
  }

  delFieldSet = () => {
    this.props.onDelete && this.props.onDelete();
  }

  getHtml() {
    const itemValue = this.props.value;
    if (itemValue.type === 0) {
      return (
        <div style={{ display: 'inline-block' }}>
          <Select style={{ width: 140, marginRight: '10px' }} onChange={this.selectChange.bind(this, 'fieldid')} value={itemValue.fieldid}>
            {
              this.state.fields.map(item => {
                return <Option key={item.fieldid} value={item.fieldid}>{item.displayname}</Option>;
              })
            }
          </Select>
          <Select style={{ width: 140 }} onChange={this.selectChange.bind(this, 'calcutetype')} value={itemValue.calcutetype}>
            <Option value={0}>直接取值</Option>
            <Option value={1}>求和</Option>
            <Option value={2}>求平均</Option>
            <Option value={3}>计数</Option>
          </Select>
        </div>
      );
    } else {
      return (
        <Input style={{ width: 290 }} onChange={this.inputChange} value={itemValue.func} />
      );
    }
  }

  render() {
    const entityList = this.props.entityList;
    const itemValue = this.props.value;
    return (
      <div style={{ marginBottom: '4px' }}>
        <Select style={{ width: 100, marginRight: '10px' }} disabled value={itemValue.type}>
          <Option value={0}>配置</Option>
          <Option value={1}>函数</Option>
          <Option value={2}>服务</Option>
        </Select>
        <Select style={{ width: 140, marginRight: '10px' }} onChange={this.selectChange.bind(this, 'relentityid')} value={itemValue.relentityid}>
          {
            entityList.map(item => {
              return <Option key={item.entityid} value={item.entityid}>{item.entityname}</Option>;
            })
          }
        </Select>
        {
          this.getHtml()
        }
        <Icon type="delete" style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={this.delFieldSet} />
      </div>
    );
  }
}


export default connect(
  state => {
    const { entityList } = state.entityTabs;
    return {
      entityList
    };
  }
)(SelectCombine);
