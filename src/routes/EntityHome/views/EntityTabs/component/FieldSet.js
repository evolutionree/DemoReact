/**
 * Created by 0291 on 2018/4/28.
 */
import React from 'react';
import { Menu, Dropdown, Button } from 'antd';
import SelectCombine from './SelectCombine';
import _ from 'lodash';

class FieldSet extends React.Component {

  static propTypes = {

  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      value: React.PropTypes.array,
      onChange: React.PropTypes.func.isRequired
    };
  }

  add = ({ key }) => {
    const valueLength = this.props.value.length;
    const newFormModel = [...this.props.value, {
      index: valueLength + 1,
      type: +key,
      relentityid: '',
      fieldid: '',
      calcutetype: '',
      func: ''
    }];
    this.props.onChange && this.props.onChange(newFormModel);
  }

  onChange = (index, value) => {
    const newFormModel = _.cloneDeep(this.props.value);
    newFormModel[index] = value;
    this.props.onChange && this.props.onChange(newFormModel);
  }

  delFieldSet = (index) => {
    const value = this.props.value.filter((iten, i) => {
      return i !== index;
    });
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    const menu = (//0配置1函数2服务
      <Menu onClick={this.add}>
        <Menu.Item key={0}>配置</Menu.Item>
        <Menu.Item key={1}>函数</Menu.Item>
        <Menu.Item key={2}>服务</Menu.Item>
      </Menu>
    );

    return (
      <div>
        {
          this.props.value.map((item, index) => {
            return (
              <div key={index} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '0px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>q{index + 1}</span>
                <SelectCombine value={item} onChange={this.onChange.bind(this, index)} onDelete={this.delFieldSet.bind(this, index)} />
              </div>
            );
          })
        }
        <Dropdown overlay={menu} placement="bottomCenter">
          <Button style={{ margin: '10px 0' }}>添加</Button>
        </Dropdown>
      </div>
    );
  }
}

export default FieldSet;
