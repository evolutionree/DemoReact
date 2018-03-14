/**
 * Created by 0291 on 2018/3/13.
 */
import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';

class LabelSelect extends Component {
  static propTypes = {
    label: React.PropTypes.any,
    dataSource: React.PropTypes.array
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  onChange = (value) => {
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    return (
      <div>
        {this.props.label}
        <Select value={this.props.value} style={{ width: 120, display: 'inline-block', marginLeft: '10px' }} onChange={this.onChange}>
          {
            this.props.dataSource.map((item, index) => {
              return <Option key={index} value={item.value}>{item.text}</Option>;
            })
          }
        </Select>
      </div>
    );
  }
}

export default LabelSelect;
