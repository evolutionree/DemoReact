import React, { PropTypes } from 'react';
import { controlMap } from './constants';
import { connect } from 'dva';

export const DefaultTextView = ({ value, value_name, dataSource, yearWeekData }) => {
  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  let text = value_name !== undefined ? value_name : value;
  if (text === null || text === undefined) {
    text = emptyText;
  } else {
    text += '';
  }
  if (dataSource && dataSource.sourceKey === 'weekinfo') {
    for (let i = 0; i < yearWeekData.length; i++) {
      if (text && text.indexOf(yearWeekData[i].value) > -1) {
        text = yearWeekData[i].label;
        break;
      }
    }
  }
  return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{text}</div>;
};

class DynamicFieldView extends React.Component {
  static propTypes = {
    isCommonForm: PropTypes.bool,
    entityTypeId: PropTypes.string,
    isTable: PropTypes.bool,
    value: PropTypes.any,
    value_name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]), // 给控件显示值用，如用户控件
    controlType: PropTypes.number.isRequired,
    config: PropTypes.object
  };
  static defaultProps = {
    isTable: false
  };
  render() {
    const props = {
      isCommonForm: this.props.isCommonForm,
      entityTypeId: this.props.entityTypeId,
      isTable: this.props.isTable,
      value: this.props.value,
      value_name: this.props.value_name,
      yearWeekData: this.props.yearWeekData,
      ...this.props.config
    };
    const ctrlType = this.props.controlType;
    const ControlComponent = (controlMap[ctrlType] && controlMap[ctrlType].View) || DefaultTextView;
    return React.createElement(ControlComponent, props);
  }
}

export default connect(
  state => state.app
)(DynamicFieldView);
