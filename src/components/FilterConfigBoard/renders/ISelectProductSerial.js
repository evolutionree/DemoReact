import React, { PropTypes, Component } from 'react';
import SelectProductSerial from '../../DynamicForm/controls/SelectProductSerial';

class ISelectProductSerial extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = ({ value, value_name }) => {
    this.props.onChange({
      dataVal: value,
      dataVal_name: value_name
    });
  };

  render() {
    const { dataVal, dataVal_name } = this.props.value;
    return (
      <SelectProductSerial
        value={dataVal}
        value_name={dataVal_name}
        onChangeWithName={this.handleChange}
        multiple={1}
      />
    );
  }
}

export default ISelectProductSerial;
