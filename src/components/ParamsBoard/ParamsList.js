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

  static defaultProps = {
    delTipInfo: '确认删除吗？'
  }

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
    const currFieldsValues = { ...currItem };
    this.setState({
      currIndex: index,
      currFieldsValues
    });
  }

  handleFieldsChange(fieldKey, val) {
    this.setState({
      currFieldsValues: {
        ...this.state.currFieldsValues,
        [fieldKey]: val
      }
    });
  }

  handleUpdate() {
    this.props.onUpdate(this.state.currFieldsValues, this.props.currIndex);
  }

  handleDel(...args) {
    Modal.confirm({
      content: this.props.delTipInfo,
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
            value={isEditing ? this.state.currFieldsValues[field.key] : item[field.key]}
            editing={isEditing}
            onChange={(val) => this.handleFieldsChange(field.key, val)}
            onBlur={this.handleBlur}
            maxLength={field.maxLength}
            link={field.link}
            onClick={this.paramsClickHandler.bind(this, item)}
            isIntl={field.intl}
          />
        ))}

        <div className={styles.actions}>
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
        </div>
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
