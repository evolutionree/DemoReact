import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, Form, message, Input, Button } from 'antd';
import { queryNextNodeData, addCaseItem, addCaseItemMultiple, auditCaseItem } from '../../services/workflow';
import { queryUsers } from '../../services/structure';
// import { getGeneralProtocol } from '../../services/entcomm';
import { queryFields } from '../../services/entity';
import CaseUserSelect from './CaseUserSelect';
import { DynamicFormAdd } from '../DynamicForm';

const FormItem = Form.Item;

class WorkflowCaseModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    caseId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]),
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  };
  static defaultProps = {};

  dynamicFormInstances = {};

  constructor(props) {
    super(props);
    this.state = {
      allUsers: [],
      caseUsers: [],
      dynamicForms: {},
      dynamicFormProtocols: {},
      nodeInfo: null,
      modalPending: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.props.form.resetFields();
      Promise.all([
        this.fetchNextNodeData(nextProps.caseId),
        this.fetchAllUsers()
      ]).then(([nextNodeData, allUsers]) => {
        const nodeInfo = nextNodeData.node[0];
        const caseUsers = nextNodeData.user;
        this.setState({
          caseUsers,
          nodeInfo,
          allUsers
        });
        if (-1 === nodeInfo.nodenum) {
          // 流程结束，关闭
          //message.success('提交成功');
          this.props.onDone();
        }
        if (nodeInfo.nodetype === 1) { // 会审，列出所有审批人
          this.props.form.setFieldsValue({
            handleuser: caseUsers.map(u => u.userid)
          });
        } else if (caseUsers.length === 1) {
          this.props.form.setFieldsValue({
            handleuser: caseUsers.map(u => u.userid)
          });
        }
        const showFields = nodeInfo.columnconfig && nodeInfo.columnconfig.config;
        if (showFields) {
          // this.handleShowFields(showFields);
        }
      });
    } else if (isClosing) {
      this.resetState();
    }
  }

  handleShowFields = (showFields) => {
    const promises = showFields.map(item => queryFields(item.entityId).then(result => {
      const allFields = result.data.entityfieldpros;
      const _fields = item.fields.map(_item => {
        const { fieldId, isRequired } = _item;
        const match = _.find(allFields, ['fieldid', fieldId]);
        if (!match) return null;
        return {
          ...match,
          fieldconfig: match.fieldconfig ? { ...match.fieldconfig, isVisible: 1 } : { isVisible: 1 },
          isrequire: !!isRequired
        };
      });
      return {
        entityId: item.entityId,
        fields: _fields.filter(i => !!i)
      };
    }));
    Promise.all(promises).then(result => {
      const dynamicForms = {};
      const dynamicFormProtocols = {};
      result.forEach(item => {
        dynamicForms[item.entityId] = {};
        dynamicFormProtocols[item.entityId] = item.fields;
      });
      this.setState({ dynamicForms, dynamicFormProtocols });
    }, error => {
      message.error('获取动态表单字段出错');
    });
  };

  resetState = () => {
    this.props.form.resetFields();
    this.setState({
      allUsers: [],
      caseUsers: [],
      nodeInfo: null,
      modalPending: false,
      dynamicForms: {},
      dynamicFormProtocols: {}
    });
  };

  fetchNextNodeData = caseId => {
    const _caseId = typeof caseId === 'string' ? caseId : caseId[0];
    return queryNextNodeData(_caseId).then(result => result.data);
  };

  fetchAllUsers = () => {
    const params = {
      userName: '',
      deptId: '7f74192d-b937-403f-ac2a-8be34714278b',
      userPhone: '',
      pageSize: 9999,
      pageIndex: 1,
      recStatus: 1
    };
    return queryUsers(params).then(result => result.data.pagedata);
  };

  getDynamicFormArray = () => {
    return _.map(this.state.dynamicFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
  };

  getCaseData = () => {
    const formArray = this.getDynamicFormArray();
    const data = formArray.map(item => {
      const { entityId } = item;
      return {
        entityid: entityId,
        fields: this.state.dynamicForms[entityId]
      };
    });
    return { data };
  };

  validateDynamicForm = () => {
    const self = this;
    const formArray = this.getDynamicFormArray();
    let result = true;
    validateNext();
    return result;

    function validateNext() {
      const item = formArray[0];
      if (!item) return;

      const formInstance = self.dynamicFormInstances[item.entityId];
      formArray.shift();
      formInstance.validateFields((err, values) => {
        if (err) result = false;
        validateNext();
      });
    }
  };

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (!this.validateDynamicForm()) return message.error('请检查表单');

      const params = {
        caseid: this.props.caseId,
        nodenum: this.state.nodeInfo.nodenum,
        handleuser: values.handleuser.join(','),
        copyuser: values.copyuser.join(','),
        reamark: values.reamark,
        casedata: this.getCaseData()
      };
      this.setState({ modalPending: true });
      const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
      execFn(params).then(result => {
        this.setState({ modalPending: false });
        message.success('提交成功');
        this.props.onDone(result);
      }, err => {
        message.error(err.message || '提交审批数据失败');
        this.setState({ modalPending: false });
      });
    });
  };

  onCloseFlow = () => {
    this.setState({ modalPending: true });
    const params = {
      caseid: this.props.caseId,
      nodenum: -1,
      suggest: '',
      ChoiceStatus: 1
    };
    auditCaseItem(params).then(result => {
      this.setState({ modalPending: false });
      this.props.onDone(result);
    }, err => {
      message.error(err.message || '关闭流程失败');
      this.setState({ modalPending: false });
    });
  };

  checkHandleUser = (rule, value, callback) => {
    if (!value || !value.length) {
      callback('请选择审批人');
    }
    callback();
  };

  render() {
    const { form, visible, onCancel } = this.props;
    const { caseUsers, nodeInfo, allUsers, dynamicForms } = this.state;
    const isFreeFlow = nodeInfo && nodeInfo.flowtype === 0; // 自由流程

    const footer = [
      <Button key="cancel" onClick={onCancel}>取消</Button>,
      <Button key="ok" onClick={this.onOk}>确定</Button>
    ];

    const dynamicFormsArray = this.getDynamicFormArray();

    if (isFreeFlow) { // 自由流程
      footer.push(<Button key="custom" onClick={this.onCloseFlow}>关闭流程</Button>);
    }

    return (
      <Modal
        title={nodeInfo ? nodeInfo.nodename : '选择审批和抄送人'}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        footer={footer}
      >
        {!!nodeInfo && <Form>
          <FormItem label="审批人">
            {form.getFieldDecorator('handleuser', {
              initialValue: [],
              rules: [{ validator: this.checkHandleUser }, { required: true }]
            })(
              <CaseUserSelect
                users={isFreeFlow ? allUsers : caseUsers}
                disabled={nodeInfo.nodetype === 1}
                filterUsers={form.getFieldValue('copyuser')}
                limit={nodeInfo.allowmulti ? nodeInfo.auditnum : 1}
              />
            )}
          </FormItem>
          <FormItem label="抄送人">
            {form.getFieldDecorator('copyuser', {
              initialValue: []
            })(
              <CaseUserSelect
                users={allUsers}
                filterUsers={form.getFieldValue('handleuser')}
                limit={0}
              />
            )}
          </FormItem>
        </Form>}
        {dynamicFormsArray.map(item => (
          <DynamicFormAdd
            key={item.entityId}
            entityTypeId={item.entityId}
            fields={item.protocols}
            value={dynamicForms[item.entityId] || {}}
            onChange={value => this.setState({ dynamicForms: { ...dynamicForms, [item.entityId]: value } })}
            ref={inst => this.dynamicFormInstances[item.entityId] = inst}
          />
        ))}
      </Modal>
    );
  }
}

export default Form.create()(WorkflowCaseModal);
