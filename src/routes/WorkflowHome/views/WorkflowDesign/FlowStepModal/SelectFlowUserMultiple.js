import React, { PropTypes, Component } from 'react';
import SelectUser from '../../../../../components/DynamicForm/controls/SelectUser';

class SelectFlowUserMultiple extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { type, data } = this.props.value;
    return (
      <SelectUser
        dataRange={1}
        placeholder="请选择审批人"
        value={data.userid}
        value_name={data.username}
        onChange={() => { }}
        onChangeWithName={({ value, value_name }) => {
          this.props.onChange({ type: 2, data: { userid: value, username: value_name } });
        }}
        multiple={1}
      />
    );
  }
}

export default SelectFlowUserMultiple;

