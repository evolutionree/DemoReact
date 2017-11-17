import React from 'react';
import { Button } from 'antd';
import connectBasicData from '../../models/connectBasicData';
import LabelList from './LabelList';
import DeptSelectModal from './DeptSelectModal';
import styles from './styles.less';

class DeptSelect extends React.Component {
  static propTypes = {
    departments: React.PropTypes.array,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  handleOk = (arrDepts) => {
    this.hideModal();
    this.props.onChange(arrDepts.join(','));
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  handleRemove = (item) => {
    const { value } = this.props;
    const arrValue = value ? value.split(',') : [];
    const newValue = arrValue.filter(id => id !== item.id).join(',');
    this.props.onChange(newValue);
  };

  getDeptName = (deptId) => {
    function loopNodes(nodes) {
      nodes.forEach(node => {
        if (node.deptid === deptId) {
          deptName = node.deptname;
        } else if (node.children && node.children.length) {
          loopNodes(node.children);
        }
      });
    }
    let deptName = '';
    loopNodes(this.props.departments);
    return deptName;
  };

  renderValue = () => {
    const { value, placeholder } = this.props;
    if (!value || !value.length) {
      return <div className={styles.placeholder}>{placeholder || ''}</div>;
    }
    const labels = value.split(',').map(deptId => {
      return {
        id: deptId,
        name: this.getDeptName(deptId)
      };
    });
    return (
      <LabelList labels={labels} onRemove={this.handleRemove} textKey="name" key="id" />
    );
  };

  render() {
    return (
      <div className={styles.fieldwrap}>
        {this.renderValue()}
        <Button onClick={this.showModal}>选择团队</Button>
        <DeptSelectModal
          visible={this.state.modalVisible}
          selectedDepts={this.props.value ? this.props.value.split(',') : []}
          onOk={this.handleOk}
          onCancel={this.hideModal}
        />
      </div>
    );
  }
}

export default connectBasicData('departments', DeptSelect);
