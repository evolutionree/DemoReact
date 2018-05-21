/**
 * Created by 0291 on 2018/5/21.
 */
import React, { PropTypes, Component } from 'react';
import { Icon, Checkbox, InputNumber, message, Row, Col } from 'antd';
import SchemeSelect from './SchemeSelect';
import _ from 'lodash';
import Styles from './RelTable.less';

const columnName = {
  EntityId: 'entityid',
  Cascase: 'jilian',
  SameData: 'same'
}

class RelTable extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      value: PropTypes.array
    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  onSelectHandler = (index, value) => {
    let newValue = _.cloneDeep(this.props.value);
    newValue[index][columnName.EntityId] = value;
    this.props.onChange(newValue);
  }

  onCheckboxChange = (index, fieldname, e) => {
    let newValue = _.cloneDeep(this.props.value);
    newValue[index][fieldname] = e.target.checked;
    this.props.onChange(newValue);
  }

  add = () => {
    let newValue = [
      ...this.props.value || [],
      {
        [columnName.EntityId]: '',
        [columnName.Cascase]: false,
        [columnName.SameData]: false
      }
    ];
    this.props.onChange(newValue);
  }

  onDel = (index) => {
    const newValue = this.props.value.filter((item, itemIndex) => {
      return index !== itemIndex;
    });
    this.props.onChange(newValue);
  }

  AllOperate = (fieldname, operateType) => {
    const newValue = _.cloneDeep(this.props.value).map(item => {
      item[fieldname] = operateType;
      return item;
    });
    this.props.onChange(newValue);
  }

  IsAllChecked = (field) => { //是否全选
    if (_.find(this.props.value, item => item[field] === false)) {
      return false;
    } else {
      return true;
    }
  }

  render() {
    const { value } = this.props;
    const allCascaseChecked = this.IsAllChecked(columnName.Cascase);
    const allSameChecked = this.IsAllChecked(columnName.SameData);
    return (
      <div className={Styles.Wrap}>
        <Row className={Styles.Header}>
          <Col span={8}>选择对象</Col>
          <Col span={8}>级联</Col>
          <Col span={8}>相同数据</Col>
        </Row>
        {
          value && value instanceof Array && value.map((item, index) => {
            return (
              <Row className={Styles.body} key={index}>
                <Col span={8}><SchemeSelect value={item[columnName.EntityId]} onChange={this.onSelectHandler.bind(this, index)} /></Col>
                <Col span={8}><Checkbox checked={item[columnName.Cascase]} onChange={this.onCheckboxChange.bind(this, index, columnName.Cascase)} /></Col>
                <Col span={8}>
                  <Checkbox checked={item[columnName.SameData]} onChange={this.onCheckboxChange.bind(this, index, columnName.SameData)} />
                  <Icon type="close-circle" onClick={this.onDel.bind(this, index)} />
                </Col>
              </Row>
            );
          })
        }
        <Row>
          <Col span={8}><a href="javascript:;" onClick={this.add}>添加</a></Col>
          <Col span={8}><a href="javascript:;" onClick={this.AllOperate.bind(this, columnName.Cascase, !allCascaseChecked)}>{allCascaseChecked ? '反选' : '全选'}</a></Col>
          <Col span={8}><a href="javascript:;" onClick={this.AllOperate.bind(this, columnName.SameData, !allSameChecked)}>{allSameChecked ? '反选' : '全选'}</a></Col>
        </Row>
      </div>
    );
  }
}

export default RelTable;
