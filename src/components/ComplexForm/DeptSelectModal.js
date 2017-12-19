/**
 * Created by 0291 on 2017/11/3.
 */
import React from 'react';
import { Modal, Col, Row, message } from 'antd';
import DepartmentTree from '../DepartmentTree';

class DeptSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    selectValue: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.string
    })),
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {
    visible: false,
    selectValue: []
  };

  constructor(props) {
    super(props);
    this.state = {
      currentSelected: props.selectValue
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSelected: nextProps.selectValue
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
    if (!this.state.currentSelected.length) {
      message.warning('请选择发送部门');
      return;
    }
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
              checkStrictly
              checkChildrenRecursively
              checkedKeys={{ checked: this.state.currentSelected && this.state.currentSelected instanceof Array && this.state.currentSelected.map(item => item.id), halfChecked: [] }}
              onCheckChange={this.onChange}
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default DeptSelectModal;
