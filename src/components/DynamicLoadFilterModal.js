import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import FilterModal from './FilterModal';

class DynamicLoadFilterModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    protocol: PropTypes.array,
    ColumnFilter: PropTypes.object,
    keyName: PropTypes.string.isRequired
  };
  static defaultProps = {};

  render() {
    const { keyName, title, protocol, ColumnFilter, dispatch } = this.props;
    const { showModals, entityId } = this.props[keyName];
    const params = {
      keyName,
      title,
      protocol,
      ColumnFilter,
      dispatch,
      visible: /cancelFilter/.test(showModals),
      entityId
    };
    return <FilterModal {...params} />;
  }
}

export default connect(state => state)(DynamicLoadFilterModal);
