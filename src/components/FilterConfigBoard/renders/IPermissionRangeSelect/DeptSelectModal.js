import React from 'react';
import { Modal, Col, Row, Checkbox } from 'antd';
import DepartmentTree from '../../../../components/DepartmentTree';

class DeptSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectedDepts: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.string
    })),
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
      currentSelected: nodes.map(node => ({
        name: node.deptname,
        id: node.deptid
      }))
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
        <Row gutter={20}>
          <Col span={12}>
            <div>团队组织</div>
            <DepartmentTree
              checkable
              checkedKeys={this.state.currentSelected.map(item => item.id)}
              onCheckChange={this.onChange}
            />
          </Col>
          {/*<Col span={12}>*/}
            {/*<div>角色列表</div>*/}
            {/*<div>*/}
              {/*<Checkbox checked>全部角色</Checkbox>*/}
            {/*</div>*/}
          {/*</Col>*/}
        </Row>
      </Modal>
    );
  }
}

export default DeptSelectModal;
