import React, { PropTypes } from 'react';
import { Icon } from 'antd';
import { controlMap } from './constants';
import { connect } from 'dva';

export const DefaultTextView = (props) => {
  const { value, value_name, dataSource, yearWeekData, linkfieldUrl, ifstock, onViewStock } = props;
  if (linkfieldUrl) {
    return <a style={{ wordWrap: 'break-word', whiteSpace: 'normal' }} href={linkfieldUrl} target="_blank">{value || '(查看连接)'}</a>;
  } else if (value && typeof value === 'string' && (value.indexOf('http') === 0 || value.indexOf('www') === 0)) {
    const linkUrl = value.indexOf('http') === 0 ? value : `http://${value}`;
    return <a title={value} href={linkUrl} target="_blank">{value}</a>;
  }

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
  return (
    <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
      {text || emptyText}
      {ifstock ? <Icon type="database" style={{ marginLeft: '1em', color: '#3398db', cursor: 'pointer' }} title="查看库存" onClick={onViewStock} /> : null}
    </div>
  );
};

class DynamicFieldView extends React.Component {
  static propTypes = {
    isCommonForm: PropTypes.bool,
    entityTypeId: PropTypes.string,
    isTable: PropTypes.bool,
    width: PropTypes.number,
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
      linkfieldUrl: this.props.linkfieldUrl,
      isCommonForm: this.props.isCommonForm,
      width: this.props.width,
      mainEntityId: this.props.entityId, //嵌套表格的实体定义属性名 跟 独立实体 简单实体 重名了，重新加一个  （嵌套实体 导入用到）
      entityTypeId: this.props.entityTypeId,
      isTable: this.props.isTable,
      value: this.props.value,
      value_name: this.props.value_name,
      yearWeekData: this.props.yearWeekData,
      fieldname: this.props.fieldname,
      onViewStock: this.props.onViewStock,
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
