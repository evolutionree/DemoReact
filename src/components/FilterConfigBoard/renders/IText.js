import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';

class INumber extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  parseValue = () => {
    return this.props.value.dataVal;
  };

  handleChange = event => {
    this.props.onChange({ dataVal: event.target.value });
  };

  render() {
    return (
      <Input
        type="text"
        placeholder="请输入文本"
        style={{ width: '100%' }}
        value={this.parseValue()}
        onChange={this.handleChange}
      />
    );
  }
}

export default INumber;
