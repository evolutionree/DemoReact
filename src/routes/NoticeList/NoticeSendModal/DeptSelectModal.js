import React from 'react';
import { Modal, Col, Row, Checkbox, message } from 'antd';
import DepartmentTree from '../../../components/DepartmentTree';
import RoleGroupTree from '../../../components/RoleGroupTree';

class DeptSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedDepts: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.string
    })),
    selectedRoles: React.PropTypes.array,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {
    visible: false,
    selectedDepts: [],
    selectedRoles: []
  };

  constructor(props) {
    super(props);
    this.state = {
      currentSelected: props.selectedDepts,
      currentSelectedRoles: props.selectedRoles
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSelected: nextProps.selectedDepts,
      currentSelectedRoles: nextProps.selectedRoles
    });
  }

  onChange = (ids, nodes) => {
    this.setState({
      currentSelected: nodes.map(node => ({
        name: node.deptname,
        id: node.deptid
      }))
    });
  };
  onRoleChange = (ids, nodes) => {
    this.setState({
      currentSelectedRoles: nodes.map(node => ({
        name: node.rolename,
        id: node.roleid
      }))
    });
  };

  handleOk = () => {
    // const newSelected = this.state.currentSelected.map(node => ({
    //   name: node.name,
    //   id: node.id,
    //   roles: this.state.currentSelectedRoles
    // }));
    // this.state.currentSelected = newSelected;
    // console.log(this.state.currentSelected);
    // console.log(this.state.currentSelectedRoles);
    // console.log(newSelected);
    // this.props.onOk(this.state.currentSelected);

    if (!this.state.currentSelected.length) {
      message.error('请选择发送部门');
      return;
    }
    this.props.onOk({
      depts: this.state.currentSelected,
      roles: this.state.currentSelectedRoles
    });
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
        <Row gutter={20}>
          <Col span={12}>
            <div>团队组织</div>
            <DepartmentTree
              checkable
              checkStrictly
              checkChildrenRecursively
              checkedKeys={{ checked: this.state.currentSelected.map(item => item.id), halfChecked: [] }}
              onCheckChange={this.onChange}
            />
          </Col>
          <Col span={12}>
            <div>角色列表</div>
            <div>
              <RoleGroupTree
                checkable
                checkedKeys={this.state.currentSelectedRoles.map(item => item.id)}
                onCheckChange={this.onRoleChange}
              />
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default DeptSelectModal;
