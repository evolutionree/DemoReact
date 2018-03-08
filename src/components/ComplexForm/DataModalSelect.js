/**
 * Created by 0291 on 2017/11/3.
 */
import React from 'react';
import { Button } from 'antd';
import UserSelectModal from '../DynamicForm/controls/UserSelectModal';
import DeptSelectModal from './DeptSelectModal';
import LabelList from './LabelList';
import styles from './DataModalSelect.less';

class DataModalSelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.array,
    onChange: React.PropTypes.func,
    type: React.PropTypes.string.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  handleOk = (value) => {
    this.hideModal();
    this.props.onChange(value);
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  handleRemove = (item) => {
    this.props.onChange(this.props.value.filter(i => i !== item));
  };

  renderValue = () => {
    const { placeholder } = this.props;
    let value = this.props.value || this.props.defaultValue;
    if (!value || !value.length) {
      return <div className={styles.placeholder}>{placeholder || ''}</div>;
    }
    return (
      <LabelList labels={value} onRemove={this.handleRemove} textKey="name" key="id" />
    );
  };

  renderComponent() {
    let value = this.props.value || this.props.defaultValue;
    switch (this.props.type) {
      case 'DeptSelect':
        return (
          <DeptSelectModal
            visible={this.state.modalVisible}
            selectValue={value}
            onOk={this.handleOk}
            onCancel={this.hideModal}
          />
        );
      case 'UserSelect':
        return (
          <UserSelectModal
            visible={this.state.modalVisible}
            selectedUsers={value}
            onOk={this.handleOk}
            onCancel={this.hideModal}
          />
        );
      default:
        return <div>未识别到可用组件</div>;
    }
  }

  render() {
    const ButtonTitle = {
      DeptSelect: '选择团队',
      UserSelect: '选择人员'
    };
    return (
      <div className={styles.fieldwrap}>
        {this.renderValue()}
        <Button onClick={this.showModal}>{ButtonTitle[this.props.type]}</Button>
        {
          this.renderComponent()
        }
      </div>
    );
  }
}

export default DataModalSelect;
