/**
 * Created by 0291 on 2017/7/31.
 */
import React from 'react';
import { Icon, Modal } from 'antd';
import ParamEditable from './ParamEditable';
import styles from './styles.less';

class ParamsList extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    fields: React.PropTypes.array.isRequired,
    itemKey: React.PropTypes.string,
    onOrderUp: React.PropTypes.func,
    onOrderDown: React.PropTypes.func,
    onSwitch: React.PropTypes.func,
    onUpdate: React.PropTypes.func,
    onDel: React.PropTypes.func,
    showEdit: React.PropTypes.func,
    showSwitch: React.PropTypes.func,
    showDel: React.PropTypes.func,
    showOrder: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      currIndex: -1,
      currFieldsValues: {}
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleFieldsChange = this.handleFieldsChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.paramsClickHandler = this.paramsClickHandler.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currIndex: -1,
      currFieldsValues: {}
    });
  }

  handleEdit(index) {
    const currItem = this.props.items[index];
    currItem.winrate = currItem.winrate.toString().indexOf('%') > -1 ? currItem.winrate.split('%')[0] :  currItem.winrate;
    const currFieldsValues = { ...currItem };
    this.setState({
      currIndex: index,
      currFieldsValues
    });
  }

  handleFieldsChange(fieldKey, val, field) {
    let key = fieldKey;
    if (field.intl) {
      key = fieldKey + '_lang';
    }

    this.setState({
      currFieldsValues: {
        ...this.state.currFieldsValues,
        [key]: val
      }
    });
  }

  handleUpdate() {
    this.props.onUpdate(this.state.currFieldsValues, this.props.currIndex);
  }

  handleDel(...args) {
    Modal.confirm({
      title: '销售删除阶段,会破坏已有商机的数据,确认删除？',
      onOk: () => {
        this.props.onDel(...args);
      }
    });
  }

  handleBlur = () => {
    console.log('blur..');
    // this.setState({ currIndex: -1 });
  };

  paramsClickHandler(item) { //点击某个参数的事件
    this.props.onClick && this.props.onClick(item);
  }

  renderItem(item, index, { length }) {
    const { onOrderUp, onOrderDown, onSwitch, onDel } = this.props;

    const visible = { visibility: 'visible' };
    const hidden = { visibility: 'hidden' };

    const isFirst = index === 0;
    const isLast = index === length - 1;
    const isEditing = index === this.state.currIndex;

    const canEdit = this.props.showEdit ? this.props.showEdit(item) : true;
    const canDel = this.props.showDel ? this.props.showDel(item) : true;
    const canSwitch = this.props.showSwitch ? this.props.showSwitch(item) : true;
    const canOrder = this.props.showOrder ? this.props.showOrder(item) : true;
    return (
      <li className={styles.row} key={index}>
        <span className={styles.order}>{index + 1}</span>

        {this.props.fields.map(field => (
          <ParamEditable
            ref="ParamEditable"
            key={field.key}
            name={field.key}
            value={isEditing ? this.state.currFieldsValues[field.key] : item[field.key]}
            value_lang={isEditing ? this.state.currFieldsValues[field.key + '_lang'] : item[field.key + '_lang']}
            editing={isEditing}
            onChange={(val) => this.handleFieldsChange(field.key, val, field)}
            onBlur={this.handleBlur}
            maxLength={field.maxLength}
            link={(item[field.key] === '赢单' || item[field.key] === '输单') ? false : field.link}
            onClick={this.paramsClickHandler.bind(this, item)}
            isIntl={field.intl}
          />
        ))}

        {
          (item.stagename !== '赢单' && item.stagename !== '输单') ? <div className={styles.actions}>
            {onOrderUp ? <Icon
              type="arrow-up"
              style={(isFirst || !canOrder) ? hidden : visible}
              onClick={() => { onOrderUp(item, index); }}
            /> : ''}
            {onOrderDown ? <Icon
              type="arrow-down"
              style={(isLast || !canOrder) ? hidden : visible}
              onClick={() => { onOrderDown(item, index); }}
            /> : ''}
            {onSwitch ? <Icon
              type="poweroff"
              style={item.recstatus === 0 ? { color: 'red' } : (canSwitch ? visible : hidden)}
              onClick={() => { onSwitch(item, index); }}
            /> : ''}
            <Icon
              type="edit"
              style={isEditing ? { display: 'none' } : (canEdit ? visible : hidden)}
              onClick={() => this.handleEdit(index)}
            />
            <Icon
              type="save"
              style={isEditing ? {} : { display: 'none' }}
              onClick={this.handleUpdate}
            />
            {onDel ? <Icon
              type="delete"
              style={canDel ? visible : hidden}
              onClick={() => { this.handleDel(item, index); }}
            /> : ''}
          </div> : null
        }

      </li>
    );
  }

  render() {
    return (
      <ul className={styles.list}>
        {this.props.items.map(this.renderItem)}
      </ul>
    );
  }
}

export default ParamsList;
