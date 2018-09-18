/**
 * jingren
 */
import React, { PropTypes, PureComponent } from 'react';
import { Select, Input, Card, Button } from 'antd';
import styles from './index.less';

const Option = Select.Option;

// 组织范围
const selectDataList = [
  { key: '1', name: '我的动态' },
  { key: '2', name: '我的部门' },
  { key: '3', name: '下级部门' },
  { key: '4', name: '指定部门' },
  { key: '5', name: '指定员工' },

];

// 时间范围
const selectTimeList = [
  { key: '1', name: '当天' },
  { key: '2', name: '本周' },
  { key: '3', name: '本月' },
  { key: '4', name: '本季度' },
  { key: '5', name: '本年' },
  { key: '6', name: '昨天' },
  { key: '7', name: '上周' },
  { key: '8', name: '上月' },
  { key: '9', name: '上季度' },
  { key: '10', name: '去年' },
  { key: '11', name: '指定年' },
  { key: '12', name: '指定时间范围' },
]

// 主实体类型
const selectMainTypeList = [
  { key: '1', name: '全部' },
  { key: '2', name: '客户动态' },
];

// 主实体数据名称
const selectMainDataList = [
  {

  }
];

// 动态实体
const selectDynamicTypeList = [
  { key: '1', name: '全部' },
  { key: '2', name: '客户动态' },
];


class Filtrate extends PureComponent {
  static propTypes = {

  }

  state = {

  }

  componentDidMount() {

  }

  handleChange = value => {
    console.log(`selected ${value}`);
  }

  search = () => {
    console.log(`search`);
  }

  renderTitle() {
    return (
      <div className={styles.header}>
        <Select defaultValue={selectDataList[0].key} onChange={this.handleChange} style={{ width: '120px' }}>
          {selectDataList.map(item => <Option value={item.key} key={item.key}>{item.name}</Option>)}
        </Select>

        <Select defaultValue={selectTimeList[0].key} onChange={this.handleChange} style={{ width: '120px' }}>
          {selectTimeList.map(item => <Option value={item.key} key={item.key}>{item.name}</Option>)}
        </Select>

        <Select defaultValue={selectMainTypeList[0].key} onChange={this.handleChange} style={{ width: '120px' }}>
          {selectMainTypeList.map(item => <Option value={item.key} key={item.key}>{item.name}</Option>)}
        </Select>

        <div className={styles.mainInput}><Input /></div>

        <Select defaultValue={selectDynamicTypeList[0].key} onChange={this.handleChange} style={{ width: '120px' }}>
          {selectDynamicTypeList.map(item => <Option value={item.key} key={item.key}>{item.name}</Option>)}
        </Select>

        <Button type='primary' onClick={this.search}>查询</Button>
      </div>
    )
  }

  renderExtra() {
    return (
      <span>save</span>
    )
  }

  render() {
    return (
      <div className={styles.container}>
        <Card
          title={this.renderTitle()}
          extra={this.renderExtra()}
          style={{ width: 800 }}
        >
          each
        </Card>
      </div>
    );
  }
}

export default Filtrate;
