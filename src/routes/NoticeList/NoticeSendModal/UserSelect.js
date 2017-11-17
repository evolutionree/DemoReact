import React from 'react';
import { Button } from 'antd';
import LabelList from './LabelList';
import UserSelectModal from './UserSelectModal';
import styles from './styles.less';

class UserSelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.number
    })),
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  handleOk = (depts) => {
    this.hideModal();
    this.props.onChange(depts);
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
    const { value, placeholder } = this.props;
    if (!value || !value.length) {
      return <div className={styles.placeholder}>{placeholder || ''}</div>;
    }
    return (
      <LabelList labels={value} onRemove={this.handleRemove} textKey="name" key="id" />
    );
  };

  render() {
    return (
      <div className={styles.fieldwrap}>
        {this.renderValue()}
        <Button onClick={this.showModal}>选择人员</Button>
        <UserSelectModal
          visible={this.state.modalVisible}
          selectedUsers={this.props.value}
          onOk={this.handleOk}
          onCancel={this.hideModal}
        />
      </div>
    );
  }
}

export default UserSelect;
