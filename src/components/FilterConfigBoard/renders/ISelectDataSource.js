import React, { PropTypes, Component } from 'react';
import SelectDataSource from '../../DynamicForm/controls/SelectDataSource';

class ISelectDataSource extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (jsonIdName) => {
    const { id, name } = jsonIdName ? JSON.parse(jsonIdName) : { id: '', name: '' };
    this.props.onChange({
      dataVal: id,
      dataVal_name: name
    });
  };

  render() {
    const { dataVal, dataVal_name } = this.props.value;
    const value = { id: dataVal, name: dataVal_name };
    return (
      <SelectDataSource
        value={value}
        onChange={this.handleChange}
        dataSource={this.props.options.dataSource}
        multiple={1}
      />
    );
  }
}

export default ISelectDataSource;
