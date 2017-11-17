import React, { PropTypes, Component } from 'react';
import SelectDepartment from '../../DynamicForm/controls/SelectDepartment';

class ISelectDepartment extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (value) => {
    this.props.onChange({
      dataVal: value
    });
  };

  render() {
    const { dataVal } = this.props.value;
    return (
      <SelectDepartment
        value={dataVal}
        onChange={this.handleChange}
        multiple={1}
      />
    );
  }
}

export default ISelectDepartment;
