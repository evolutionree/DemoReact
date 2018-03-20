/**
 * Created by 0291 on 2018/3/20.
 */
import React, { Component, PropTypes } from 'react';
import { Select, Button, Icon } from 'antd';
import SelectDataSource from './SelectDataSource';
import _ from 'lodash';
import Styles from './RelBusiness.less';

const Option = Select.Option;

class RelBusiness extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // JSON格式, { id, name }
    // value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    multidataSource: PropTypes.shape({
      sourceId: PropTypes.string.isRequired,
      entityId: PropTypes.string,
      entityName: PropTypes.string,
      sourceName: PropTypes.string
    }),
    designateDataSource: PropTypes.object,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {
    dataRange: 0
  };

  constructor(props) {
    super(props);
    const { multidataSource, value } = this.props;
    this.state = {
      modalVisible: false,
      addPanelVisible: value ? false : true,
      sourceId: multidataSource && multidataSource[0].sourceId,
      dataSourceValue: undefined
    };
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  openAddPanel = (e) => {
    this.setState({
      addPanelVisible: true
    });
  }

  closeAddPanel = () => {
    this.setState({
      addPanelVisible: false
    });
  }

  changeSourceId = (value) => {
    console.log(value)
    this.setState({
      sourceId: value
    });
  }

  addData = () => {
    //{"id":"96489e20-2603-48c7-a333-ec419f75d040","name":"导入客户测试04"}
    const addData = JSON.parse(this.state.dataSourceValue);

    const { multidataSource, value } = this.props;
    const selectSource = _.find(multidataSource, item => this.state.sourceId === item.sourceId);


    this.props.onChange && this.props.onChange([
      ...(value || []),
      {
        sourceId: selectSource.sourceId,
        sourceName: selectSource.sourceName,
        ...addData
      }
    ]);

    this.setState({
      addPanelVisible: false,
      sourceId: multidataSource && multidataSource[0].sourceId,
      dataSourceValue: undefined
    });
  }

  delData = () => {

  }

  render() {
    const { multidataSource, value } = this.props;
    console.log(value)
    return (
      <div className={Styles.ReBusinessWrap}>
        <div className={Styles.dataWrap}>
          <ul style={{ width: 'calc(100% - 25px)' }}>
            {
              value && value instanceof Array && value.map((item, index) => {
                return (
                  <li key={index}>
                    <span>{item.sourceName}-{item.name}</span>
                    <Icon type="close" onClick={this.delData} />
                  </li>
                );
              })
            }
          </ul>
          <Icon type="plus" onClick={this.openAddPanel} style={{ display: value ? 'block' : 'none' }} />
        </div>
        <div style={{ display: this.state.addPanelVisible ? 'block' : 'none' }} className={Styles.addPanel}>
          <div className={Styles.operate}>
            <Select style={{ width: '150px', float: 'left' }} onChange={this.changeSourceId} defaultValue={multidataSource && multidataSource[0].sourceId}>
              {
                multidataSource.map((item, index) => {
                  return <Option key={index} value={item.sourceId}>{item.entityName || '无'}</Option>;
                })
              }
            </Select>
            <SelectDataSource style={{ width: 'calc(100% - 154px)', display: 'inline-block', marginLeft: '4px' }} dataSource={{
              type: 'network',
              sourceId: this.state.sourceId
            }} placeholder="请选择数据源" value={this.state.dataSourceValue} onChange={value => this.setState({ dataSourceValue: value })} />
          </div>
          <div className={Styles.footer}>
            <Button type="default" onClick={this.closeAddPanel}>取消</Button>
            <Button onClick={this.addData}>确定</Button>
          </div>
        </div>
      </div>
    );
  }
}


export default RelBusiness;
