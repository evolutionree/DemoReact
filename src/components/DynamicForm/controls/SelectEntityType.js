import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import { queryTypes } from '../../../services/entity';

const Option = Select.Option;

class SelectEntityType extends Component {
  static propTypes = {
    entityId: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entityTypes: []
    };
    this.fetchEntityTypes(props.entityId);
  }

  fetchEntityTypes = entityId => {
    queryTypes({ entityId }).then(result => {
      const entityTypes = result.data.entitytypepros;
      this.setState({ entityTypes });
    });
  };

  handleChange = (value) => {
    this.props.onChange(value);
  };

  render() {
    return (
      <Select value={this.props.value || ''} onChange={this.handleChange}>
        <Option value="">- 请选择 -</Option>
        {this.state.entityTypes.map(item => (
          <Option key={item.categoryid}>{item.categoryname}</Option>
        ))}
      </Select>
    );
  }
}

export default SelectEntityType;
