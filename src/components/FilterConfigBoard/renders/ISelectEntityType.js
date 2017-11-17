import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import { queryTypes } from '../../../services/entity';

const Option = Select.Option;

class ISelectEntityType extends Component {
  static propTypes = {};
  static defaultProps = {};
  static contextTypes = {
    entityId: PropTypes.string
  };

  constructor(props, context) {
    super(props);
    this.state = {
      entityTypes: []
    };
    this.fetchEntityTypes(context.entityId);
  }

  fetchEntityTypes = entityId => {
    queryTypes({ entityId }).then(result => {
      const entityTypes = result.data.entitytypepros;
      this.setState({ entityTypes });
    });
  };

  handleChange = (value) => {
    this.props.onChange({
      dataVal: value
    });
  };

  render() {
    const { dataVal } = this.props.value;
    const value = dataVal || '';
    return (
      <Select value={value} onChange={this.handleChange}>
        <Option value="">- 请选择 -</Option>
        {this.state.entityTypes.map(item => (
          <Option key={item.categoryid}>{item.categoryname}</Option>
        ))}
      </Select>
    );
  }
}

export default ISelectEntityType;
