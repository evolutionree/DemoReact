import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import { is } from 'immutable';
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

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
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
