/**
 * Created by 0291 on 2018/4/28.
 */
import React from 'react';
import { Input } from 'antd';

class RuleForm extends React.Component {
  static propTypes = {
    configsets: React.PropTypes.array.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  inputChange = (index, key, e) => {
    const newConfig = [...this.props.configsets];
    newConfig[index][key] = e.target.value;
    this.props.onChange && this.props.onChange(newConfig);
  }

  render() {
    return (
      <ul>
        {
          this.props.configsets.map((item, index) => {
            return (
              <li key={index} style={{ marginBottom: '4px' }}>
                <Input placeholder="请输入统计值名称" style={{ width: 160, marginRight: '10px' }} onChange={this.inputChange.bind(this, index, 'title')} value={item.title} />
                <Input placeholder="请输入统计规则（支持+，-，*，/，（）运算符）" style={{ width: 420 }} onChange={this.inputChange.bind(this, index, 'configset')} value={item.configset} />
              </li>
            );
          })
        }
      </ul>
    );
  }
}

export default RuleForm;
