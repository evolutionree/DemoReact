import React from 'react';
import { Button } from 'antd';
import LabelList from './LabelList';
import DeptSelectModal from './DeptSelectModal';
import styles from './styles.less';

class DeptSelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.string
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
        <Button onClick={this.showModal}>选择团队</Button>
        <DeptSelectModal
          visible={this.state.modalVisible}
          selectedDepts={this.props.value}
          onOk={this.handleOk}
          onCancel={this.hideModal}
        />
      </div>
    );
  }
}

export default DeptSelect;
