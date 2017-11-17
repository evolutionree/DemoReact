import React from 'react';
import { Modal, Col, Row, Checkbox } from 'antd';
import DepartmentTree from '../../components/DepartmentTree';

class DeptSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedDepts: React.PropTypes.array,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {
    visible: false,
    selectedDepts: []
  };

  constructor(props) {
    super(props);
    this.state = {
      currentSelected: props.selectedDepts
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSelected: nextProps.selectedDepts
    });
  }

  onChange = (ids, nodes) => {
    this.setState({
      currentSelected: nodes.map(node => node.deptid)
    });
  };

  handleOk = () => {
    this.props.onOk(this.state.currentSelected);
  };

  render() {
    const { visible, onCancel } = this.props;
    return (
      <Modal
        title="选择团队"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <DepartmentTree
          checkable
          checkedKeys={this.state.currentSelected}
          checkStrictly
          onCheckChange={this.onChange}
        />
      </Modal>
    );
  }
}

export default DeptSelectModal;
