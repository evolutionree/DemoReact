import React, { PropTypes, Component } from 'react';
import { Form, Radio } from 'antd';
import { queryUsers } from '../../services/structure';
import CaseUserSelect from './CaseUserSelect';

class WorkflowCaseForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    caseNodes: PropTypes.arrayOf(PropTypes.shape({
      nodeinfo: PropTypes.object,
      approvers: PropTypes.array
    })),
    selectedNode: PropTypes.object,
    onSelectedNodeChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      allUsers: []
    };
  }

  componentDidMount() {
    this.fetchAllUsers();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedNode !== nextProps.selectedNode) {
      this.setState({ formKey: +new Date() }, this.initFormData); // FIXME 切换节点bug？
    }
  }

  fetchAllUsers = () => {
    const params = {
      userName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      userPhone: '',
      pageSize: 99999,
      pageIndex: 1,
      recStatus: 1
    };
    return queryUsers(params).then(result => {
      this.setState({ allUsers: result.data.pagedata });
    });
  };

  checkHandleUser = (rule, value, callback) => {
    if (!value || !value.length) {
      callback('请选择审批人');
    }
    callback();
  };

  // 切换节点时，初始化表单数据
  initFormData = () => {
    this.props.form.resetFields();
    if (!this.props.selectedNode) return;
    const { nodeinfo, approvers } = this.props.selectedNode;
    if (nodeinfo.nodetype === 1) { // 会审，列出所有审批人
      this.props.form.setFieldsValue({
        handleuser: approvers.map(u => u.userid)
      });
    } else if (approvers.length === 1) {
      this.props.form.setFieldsValue({
        handleuser: approvers.map(u => u.userid)
      });
    }
  };

  onRadioChange = event => {
    this.props.onSelectedNodeChange(event.target.value);
  };

  render() {
    const { form, caseNodes, selectedNode } = this.props;
    const { nodeinfo, approvers } = selectedNode || {};
    const isFreeFlow = nodeinfo && nodeinfo.flowtype === 0; // 自由流程
    return (
      <div>
        {caseNodes.length > 1 && (
          <Radio.Group value={selectedNode} onChange={this.onRadioChange}>
            {caseNodes.map(item => (
              <Radio key={item.nodeinfo.nodeid} value={item}>{item.nodeinfo.nodename}</Radio>
            ))}
          </Radio.Group>
        )}
        {nodeinfo ? <Form>
          <Form.Item label="审批人">
            {form.getFieldDecorator('handleuser', {
              initialValue: [],
              rules: [{ validator: this.checkHandleUser }, { required: true }]
            })(
              <CaseUserSelect
                users={isFreeFlow ? this.state.allUsers : approvers}
                disabled={nodeinfo.nodetype === 1}
                filterUsers={form.getFieldValue('copyuser')}
                limit={1}
              />
            )}
          </Form.Item>
          <Form.Item label="抄送人">
            {form.getFieldDecorator('copyuser', {
              initialValue: []
            })(
              <CaseUserSelect
                users={this.state.allUsers}
                filterUsers={form.getFieldValue('handleuser')}
                limit={0}
              />
            )}
          </Form.Item>
        </Form> : null}
      </div>
    );
  }
}

export default Form.create()(WorkflowCaseForm);