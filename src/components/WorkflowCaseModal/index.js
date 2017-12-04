import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, Form, message, Radio, Button } from 'antd';
import { queryNextNodeData, addCaseItem, addCaseItemMultiple, auditCaseItem, submitCaseItem } from '../../services/workflow';
import { queryUsers } from '../../services/structure';
import { queryFields } from '../../services/entity';
import CaseUserSelect from './CaseUserSelect';
import { DynamicFormAdd } from '../DynamicForm';
// import { getGeneralProtocol } from '../../services/entcomm';

const FormItem = Form.Item;

class WorkflowCaseModal extends Component {
  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    caseId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]),
    caseData: PropTypes.object, // 需要提交到下一节点的数据
    choiceStatus: PropTypes.oneOf([0, 1, 2, 3, 4]), // 审批操作类型，0拒绝 1通过 2退回 3中止 4编辑发起
    suggest: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  };
  static defaultProps = {
    choiceStatus: 4,
    suggest: ''
  };

  dynamicFormInstances = {};

  constructor(props) {
    super(props);
    this.state = {
      allUsers: [],
      nextNodes: [], // [{ nodeinfo, approvers }] 会有多个节点(分支)
      selectedNode: null, // 保存选中的nextNodes元素
      // caseUsers: [],
      // nodeInfo: null,
      dynamicForms: {},
      dynamicFormProtocols: {},
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
        if (this.checkFlowIsEnd(nextNodeData)) {
          this.props.onDone();
          return;
        }
        this.setState({
          nextNodes: nextNodeData,
          selectedNode: nextNodeData[0],
          allUsers
        }, this.initFormData);
      });
    } else if (isClosing) {
      this.resetState();
    }
  }

  resetState = () => {
    this.props.form.resetFields();
    this.setState({
      allUsers: [],
      nextNodes: [],
      selectedNode: null,
      dynamicForms: {},
      dynamicFormProtocols: {},
      modalPending: false
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
      pageSize: 99999,
      pageIndex: 1,
      recStatus: 1
    };
    return queryUsers(params).then(result => result.data.pagedata);
  };

  // 根据node数据，检查流程是否结束
  checkFlowIsEnd = nextNodes => {
    return nextNodes[0].nodeinfo.nodenum === -1;
  };

  // 切换节点时，初始化表单数据
  initFormData = () => {
    this.props.form.resetFields();

    const { nodeinfo, approvers } = this.state.selectedNode;
    if (nodeinfo.nodetype === 1) { // 会审，列出所有审批人
      this.props.form.setFieldsValue({
        handleuser: approvers.map(u => u.userid)
      });
    } else if (approvers.length === 1) {
      this.props.form.setFieldsValue({
        handleuser: approvers.map(u => u.userid)
      });
    }
    const showFields = nodeinfo.columnconfig && nodeinfo.columnconfig.config;
    if (showFields) {
      // this.handleShowFields(showFields);
    }
  };

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

  getDynamicFormArray = () => {
    return _.map(this.state.dynamicFormProtocols, (val, key) => ({ entityId: key, protocols: val }));
  };

  getCaseData = () => {
    return this.props.caseData || { data: [] };
    // const formArray = this.getDynamicFormArray();
    // const data = formArray.map(item => {
    //   const { entityId } = item;
    //   return {
    //     entityid: entityId,
    //     fields: this.state.dynamicForms[entityId]
    //   };
    // });
    // return { data };
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
        nodeid: this.state.selectedNode.nodeinfo.nodeid || '00000000-0000-0000-0000-000000000000',
        nodenum: this.state.selectedNode.nodeinfo.nodenum,
        choiceStatus: this.props.choiceStatus,
        suggest: this.props.suggest,
        handleuser: values.handleuser.join(','),
        copyuser: values.copyuser.join(','),
        // reamark: values.reamark,
        casedata: this.getCaseData()
      };
      this.setState({ modalPending: true });
      // TODO addCaseItemMultiple
      // const execFn = typeof this.props.caseId === 'string' ? addCaseItem : addCaseItemMultiple;
      submitCaseItem(params).then(result => {
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
    submitCaseItem(params).then(result => {
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

  onRadioChange = event => {
    this.setState({ selectedNode: event.target.value }, this.initFormData);
  };

  render() {
    const { form, visible, onCancel } = this.props;
    const { nextNodes, selectedNode, allUsers, dynamicForms } = this.state;
    const { nodeinfo, approvers } = selectedNode || {};
    const isFreeFlow = nodeinfo && nodeinfo.flowtype === 0; // 自由流程

    const footer = [
      <Button key="cancel" onClick={onCancel}>取消</Button>,
      <Button key="ok" onClick={this.onOk}>确定</Button>
    ];
    if (isFreeFlow) { // 自由流程
      footer.push(<Button key="custom" onClick={this.onCloseFlow}>关闭流程</Button>);
    }

    return (
      <Modal
        title={nodeinfo ? nodeinfo.nodename : '选择审批和抄送人'}
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        footer={footer}
      >
        {nextNodes.length > 1 && (
          <Radio.Group value={selectedNode} onChange={this.onRadioChange}>
            {nextNodes.map(item => (
              <Radio key={item.nodeinfo.nodeid} value={item}>{item.nodeinfo.nodename}</Radio>
            ))}
          </Radio.Group>
        )}
        {!!nodeinfo && <Form>
          <FormItem label="审批人">
            {form.getFieldDecorator('handleuser', {
              initialValue: [],
              rules: [{ validator: this.checkHandleUser }, { required: true }]
            })(
              <CaseUserSelect
                users={isFreeFlow ? allUsers : approvers}
                disabled={nodeinfo.nodetype === 1}
                filterUsers={form.getFieldValue('copyuser')}
                limit={1}
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
        {this.getDynamicFormArray().map(item => (
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
