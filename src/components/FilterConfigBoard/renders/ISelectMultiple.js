import React, { PropTypes, Component } from 'react';
import SelectMultiple from '../../DynamicForm/controls/SelectMultiple';

class ISelectMultiple extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = ({ value, value_name }) => {
    this.props.onChange({
      dataVal: value,
      dataValue_name: value_name
    });
  };

  render() {
    const { dataVal } = this.props.value;
    return (
      <SelectMultiple
        value={dataVal}
        onChangeWithName={this.handleChange}
        dataSource={this.props.options.dataSource}
      />
    );
  }
}

export default ISelectMultiple;
