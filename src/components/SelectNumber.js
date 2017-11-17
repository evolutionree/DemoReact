import React from 'react';
import { Select } from 'antd';

class SelectNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChange = val => {
    this.props.onChange(parseInt(val));
  };
  render() {
    const { value, children, onChange, ...restProps } = this.props;
    return (
      <Select value={`${value}`} onChange={this.handleChange} {...restProps}>
        {children}
      </Select>
    );
  }
}

export default SelectNumber;
