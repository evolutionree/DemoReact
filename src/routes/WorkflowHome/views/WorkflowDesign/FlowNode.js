import React, { Component, PropTypes } from 'react';
import { Input, Icon, Dropdown, Menu } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import styles from './styles.less';

const START_NODE = 0;
const END_NODE = -1;

class FlowNode extends Component {
  static propTypes = {
    id: PropTypes.string,
    title: PropTypes.node,
    nodeData: PropTypes.object,
    changeStepName: PropTypes.func,
    openStepModal: PropTypes.func,
    addNextStep: PropTypes.func,
    addBranchStep: PropTypes.func,
    delStep: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      editingValue: ''
    };
  }

  onInputChange = event => {
    this.setState({ editingValue: event.target.value });
  };

  onMenuClick = event => {
    switch (event.key) {
      case '1':
        this.props.addNextStep();
        break;
      case '2':
        this.props.addBranchStep();
        break;
      case '3':
        this.props.delStep();
        break;
      default:
    }
  };

  onEditOpen = () => {
    this.setState({ editing: true, editingValue: this.props.title });
  };

  onEditSave = () => {
    this.props.changeStepName(this.state.editingValue);
    this.setState({ editing: false, editingValue: '' });
  };

  onEditCancel = () => {
    this.setState({ editing: false, editingValue: '' });
  };

  renderTitle = () => {
    const dropdownMenu = (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="1">添加下级节点</Menu.Item>
        <Menu.Item key="2">添加同级节点</Menu.Item>
        <Menu.Item key="3">删除</Menu.Item>
      </Menu>
    );

    if (this.state.editing) {
      return (
        <div className={styles.title}>
          <div className={styles.content}>
            <Input
              size="small"
              value={this.state.editingValue}
              onChange={this.onInputChange}
             />
          </div>
          <div className={styles.controls}>
            <Icon type="check" onClick={this.onEditSave} />
            <Icon type="close" onClick={this.onEditCancel} />
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.title}>
          <div className={styles.content} title={this.props.title}>{this.props.title}</div>
          <div className={styles.controls}>
            <Icon type="edit" onClick={this.onEditOpen} />
            <Dropdown overlay={dropdownMenu}>
              <Icon type="plus" />
            </Dropdown>
          </div>
        </div>
      );
    }
  };

  renderStartNodeTitle = () => {
    const dropdownMenu = (
      <Menu onClick={this.onMenuClick}>
        <Menu.Item key="1">添加下级节点</Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.title}>
        <div className={styles.content} title={this.props.title}>{this.props.title}</div>
        <div className={styles.controls}>
          <Dropdown overlay={dropdownMenu}>
            <Icon type="plus" />
          </Dropdown>
        </div>
      </div>
    );
  };

  renderBody = () => {
    const { nodeData } = this.props;
    if (!nodeData || !nodeData.steptypeid || !nodeData.ruleconfig) {
      return <div style={{ border: '1px dashed red' }}>点击这里配置审批人</div>;
    }
    const { steptypeid, ruleconfig, nodetype } = nodeData;
    let { username, rolename, deptname, fieldlabel } = ruleconfig;
    if (nodetype === 1) { // 会审
      return (
        <div>
          <span>指定审批人(会审)：</span><br />
          <span>{username}</span>
        </div>
      );
    }
    if (steptypeid === 1) return <div>让用户自己选择审批人</div>;
    if (steptypeid === 7) return <div>流程发起人</div>;
    if (steptypeid === 8 || steptypeid === 9) {
      deptname = '上一步骤处理人所在团队';
    } else if (steptypeid === 11 || steptypeid === 10) {
      deptname = '上一步骤处理人所在团队的上级团队';
    } else if (steptypeid === 801 || steptypeid === 901) {
      deptname = '流程发起人所在团队';
    } else if (steptypeid === 111 || steptypeid === 101) {
      deptname = '流程发起人所在团队的上级团队';
    } else if (steptypeid === 802 || steptypeid === 902) {
      deptname = `表单中用户(${fieldlabel || '--'})所在团队`;
    } else if (steptypeid === 112 || steptypeid === 102) {
      deptname = `表单中用户(${fieldlabel || '--'})所在团队的上级团队`;
    }
    return (
      <div>
        {!!username && <div>
          <span>指定审批人：</span><br />
          <span>{username}</span>
        </div>}
        {!!deptname && <div>
          <span>指定审批人团队：</span><br />
          <span>{deptname}</span>
        </div>}
        {!!rolename && <div>
          <span>指定审批人角色：</span><br />
          <span>{rolename}</span>
        </div>}
      </div>
    );
  };

  render() {
    const { id, title, nodeData } = this.props;

    if (nodeData && nodeData.steptypeid === END_NODE) {
      return <div className={styles.START}>{title}</div>;
    }

    if (nodeData && nodeData.steptypeid === START_NODE) {
      return (
        <div className={styles.REVIEW}>
          {this.renderStartNodeTitle()}
          <div className={styles.body}>
            提交人发起审批
          </div>
        </div>
      );
    }

    return (
      <div className={styles.REVIEW}>
        {this.renderTitle()}
        <div className={styles.body} onClick={this.props.openStepModal}>
          {this.renderBody()}
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.workflowDesign,
  (dispatch, props) => {
    const stepId = props.id;
    return {
      changeStepName(newName) {
        dispatch({ type: 'workflowDesign/changeStepName', payload: { stepId, name: newName } });
      },
      openStepModal() {
        dispatch({ type: 'workflowDesign/openStepModal', payload: stepId });
      },
      addNextStep() {
        dispatch({ type: 'workflowDesign/addNextStep', payload: stepId });
      },
      addBranchStep() {
        dispatch({ type: 'workflowDesign/addBranchStep', payload: stepId });
      },
      delStep() {
        dispatch({ type: 'workflowDesign/delStep', payload: stepId });
      }
    };
  }
)(FlowNode);
