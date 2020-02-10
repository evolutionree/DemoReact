import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Button, Collapse, Icon, Select, Radio, Input, message } from 'antd';
import EditableCell from '../../../../components/ComplexForm/EditableCell'
import SelectUser from '../../../../components/DynamicForm/controls/SelectUser';
import SelectNumber from '../../../../components/SelectNumber';
import FlowBranchConditionModal from '../WorkflowDesign/FlowBranchConditionModal'

import styles from './index.less'

const { Panel } = Collapse;
const { Option } = Select;
const TextArea = Input.TextArea;

const formItemLayout = {
  labelCol: {
    xs: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 20 },
  },
};
const formItemLayout1 = {
  labelCol: {
    xs: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 22 },
  },
};

const SelectField = ({ keys = 'fieldname', value, onChange, disabled, fields, placeholder, style }) => {
  function onSelectChange(fieldname) {
    if (!fieldname) return onChange()
    const fieldlabel = _.find(fields, [[keys], fieldname]).displayname
    onChange(fieldname, fieldlabel)
  }

  return (
    <Select
      value={value}
      onChange={onSelectChange}
      disabled={disabled}
      placeholder={placeholder}
      style={{ width: 230, ...style }}
    >
      {fields.map(item => <Option key={item[keys]}>{item.displayname}</Option>)}
    </Select>
  )
}

const NAMESPACE = 'workflowNotify'

class WorkflowNotify extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list: props.list,
      activeKey: props.list.map((o, i) => (i + '')),
      visible: false,
      AllExpend: true,
      index: undefined
    }
  }

  componentDidMount() {
    const { Init } = this.props;

    const pathReg = /^#\/workflow\/([^/]+)/;
    const match = window.location.hash.match(pathReg);
    if (match) {
      const flowId = match[1];
      if (Init) Init(flowId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.list !== nextProps.list) {
      this.setState({
        list: nextProps.list,
        activeKey: nextProps.list.map((o, i) => (i + ''))
      })
    }
  }

  componentWillUnmount() {
    this.fetchList('clear')
  }

  fetchList = (action) => {
    const { QueryList } = this.props
    if (QueryList) QueryList(action)
  }

  handleChangeActiveKey = (activeKey) => this.setState({ activeKey })

  handleChange = (key, index, value, validateStatus) => {
    const { list } = this.state;
    const newList = [...list]
    newList[index][key] = { value, validateStatus }
    this.setState({ list: newList });
  }

  handleDel = (index) => {
    const { list } = this.state;

    list.splice(index, 1);
    this.setState({ list });
  }

  handleSetting = (i) => {
    const { list } = this.state;
    // const { info, count } = this.formValidate(list[i])
    // list[i] = info;
    // if (count) {
    //   this.setState({ list })
    //   return message.warn('存在未填字段')
    // }

    this.setState({ visible: true, index: i })
  }

  handleCancelModal = () => this.setState({ visible: false })

  handleOkModal = (idx, rule) => {
    const { list } = this.state
    list[idx].rule = rule
    if (list[idx].rules[0]) {
      list[idx].rules[0].ruleitems = rule.ruleitems
      list[idx].rules[0].ruleset = rule.ruleset
    } else {
      list[idx].rules = [rule]
    }
    this.setState({ list }, () => this.handleCancelModal())
  }

  addItem = () => {
    const { list, activeKey } = this.state;
    activeKey.push(list.length + '');
    list.push({ // 默认值
      rulename: { value: '' },
      type: { value: 1 }, // 传阅方式
      informertype: { value: 1 }, // 传阅条件
      user: { value: {} },
      spfuncname: {},
      reportrelation: { value: { type: '1' } }, // 传阅人
      rules: [],
      editable: true
    });
    this.setState({ list, activeKey });
  }

  formValidate = (info, isAll) => {
    let count = 0;

    if (!info.rulename.value) {
      info.rulename.validateStatus = 'error';
      count++
    }

    switch (info.type.value) {
      case 1:
        if (!(info.user.value.userids && info.user.value.usernames)) {
          info.user.validateStatus = 'error';
          count++;
        }
        break;
      case 2:
        if (!info.spfuncname.value) {
          info.spfuncname.validateStatus = 'error';
          count++;
        }
        break;
      case 3:
        if ([1, 2].includes(info.reportrelation.value.type * 1)) {
          if (!info.reportrelation.value.id) {
            info.reportrelation.validateStatus = 'error';
            count++;
          }
        } else if ([3].includes(info.reportrelation.value.type * 1)) {
          if (!(info.reportrelation.value.entityid && info.reportrelation.value.fieldname && info.reportrelation.value.id)) {
            info.reportrelation.validateStatus = 'error';
            count++;
          }
        }
        break;
      default:
    }

    if (isAll) {
      const hasRule = info.rule && typeof info.rule === 'object';
      return { info, count, hasRule };
    }

    return { info, count };
  }

  allSave = () => {
    const { SaveList, flowId } = this.props;
    const { list } = this.state;
    let informerrules = []

    if (list.length) {
      const validateStatus = [];
      const hasRuleIdxs = [];

      for (const i in list) {
        const { info, count, hasRule } = this.formValidate(list[i], true)

        if (count) validateStatus.push({ idx: i, info })
        if (!hasRule) hasRuleIdxs.push(i * 1 + 1)

        // 保存逻辑
        const record = list[i]
        const endnodeconfig = {}
        const type = record.type.value
        const mapList = new Map([[0, 'allpass'], [1, 'approve'], [2, 'failed']])

        for (const [key, value] of mapList) {
          endnodeconfig[value] = (key === record.informertype.value) ? {
            type,
            userids: type === 1 ? record.user.value.userids : '',
            usernames: type === 1 ? record.user.value.usernames : '',
            spfuncname: type === 2 ? record.spfuncname.value : '',
            reportrelation: type === 3 ? record.reportrelation.value : {}
          } : null
        }

        if (record.rule) record.rule.rulename = record.rulename.value

        informerrules[i] = {
          flowid: flowId,
          rule: record.rule,
          ruleconfig: JSON.stringify({ endnodeconfig })
        }
      }

      if (validateStatus.length) {
        const newList = [...list]
        validateStatus.forEach(item => (newList[item.idx] = item.info))
        this.setState({ list: newList })
        return message.error('存在必填字段未填写，请检查')
      }
      if (hasRuleIdxs.length) return message.warn(`请先配置第${hasRuleIdxs.join(',')}行的规则，再进行保存`)
    }

    const params = { flowid: flowId, informerrules };
    this.setState({ AllExpend: true })
    if (SaveList) SaveList(params)
  }

  toggleAllExpend = () => {
    const { list, AllExpend } = this.state
    const activeKey = AllExpend ? [] : list.map((o, i) => (i + ''));
    this.setState({ activeKey, AllExpend: !AllExpend })
  }

  genTitle = (item, index) => {
    return (
      <div className={styles.genTitle}>
        <div className={styles.title}>
          <span>规则名称：</span>
          <Form.Item
            style={{ display: 'inline-block' }}
            validateStatus={item.rulename.validateStatus}
          >
            <EditableCell editable={item.editable} value={item.rulename.value} onChange={val => this.handleChange('rulename', index, val, !val ? 'error' : '')} />
          </Form.Item>
        </div>
        <div className={styles.extra}>
          <Icon
            type="setting"
            onClick={event => {
              event.stopPropagation();
              this.handleSetting(index);
            }}
          />
          <Icon
            type="delete"
            onClick={event => {
              event.stopPropagation();
              this.handleDel(index);
            }}
          />
        </div>
      </div>
    );
  }

  genChildren = (item, index) => {
    return (
      <div className={styles.genChildren}>
        <div className={styles.row}>
          <Form.Item
            {...formItemLayout}
            style={{ width: '50%' }}
            label="传阅方式"
          >
            <Radio.Group className={styles.radio} onChange={e => this.handleChange('type', index, e.target.value)} value={item.type.value}>
              <Radio value={1}>指定传阅人</Radio>
              <Radio value={2}>自定义传阅人</Radio>
              <Radio value={3}>汇报关系</Radio>
            </Radio.Group>

          </Form.Item>
          <Form.Item
            {...formItemLayout}
            style={{ width: '50%' }}
            label="传阅条件"
          >
            <Radio.Group className={styles.radio} onChange={e => this.handleChange('informertype', index, e.target.value)} value={item.informertype.value}>
              <Radio value={0}>全部</Radio>
              <Radio value={1}>通过</Radio>
              <Radio value={2}>不通过</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
        <div>
          <Form.Item
            {...formItemLayout1}
            label="传阅人"
          >
            {this.genPerson(item, index)}
          </Form.Item>
        </div>
      </div>
    );
  }

  genPerson = (item, index) => {

    switch (item.type.value) {
      case 1:
        return (
          <Form.Item
            validateStatus={item.user.validateStatus}
            help={item.user.validateStatus === 'error' ? '请选择传阅人' : ''}
          >
            <SelectUser
              dataRange={1}
              placeholder="请选择传阅人"
              style={{ width: '260px', height: 'inherit' }}
              value={item.user ? item.user.value.userids : undefined}
              value_name={item.user ? item.user.value.usernames : undefined}
              onChange={() => { }}
              onChangeWithName={({ value: userids, value_name: usernames }) => this.handleChange('user', index, { userids, usernames }, (!(userids && usernames) ? 'error' : ''))}
              isReadOnly={0}
              multiple={1}
            />
          </Form.Item>
        )
      case 2:
        return (
          <Form.Item
            validateStatus={item.spfuncname.validateStatus}
            help={item.spfuncname.validateStatus === 'error' ? '请输入需要执行的sql语句' : ''}
          >
            <TextArea
              value={item.spfuncname.value || undefined}
              placeholder="输入需要执行的sql语句"
              onChange={e => this.handleChange('spfuncname', index, e.target.value, !e.target.value ? 'error' : '')}
            />
          </Form.Item>
        )
      case 3:
        const { flowEntities: entities } = this.props

        let formFields = [];
        let userFields = [];
        let reportrelationList = [];

        if (entities && entities[0]) {
          formFields = entities[0].forms;
          userFields = entities[0].fields.filter(field => [25, 1002, 1003, 1006].indexOf(field.controltype) !== -1);
          reportrelationList = entities[0].reportrelationList;
        }
        const { reportrelation } = item

        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <SelectNumber
              style={{ width: '260px' }}
              value={reportrelation.value.type || '1'}
              onChange={type => this.handleChange('reportrelation', index, { ...reportrelation.value, type })}
            >
              {['流程发起人', '上一步骤处理人', '表单中的人员'].map((item, index) => <Option key={index} value={(index + 1) + ''}>{item}</Option>)}
            </SelectNumber>
            { // 表单中的人员
              (reportrelation.value.type * 1) === 3 &&
              <Form.Item
                validateStatus={item.reportrelation.validateStatus}
                help={item.reportrelation.validateStatus === 'error' ? '请选择表单' : ''}
              >
                <SelectField
                  keys="entityid"
                  style={{ width: 160 }}
                  value={item.reportrelation.value.entityid || undefined}
                  placeholder="请选择表单"
                  onChange={(entityid, fieldlabel) => this.handleChange('reportrelation', index, { ...reportrelation.value, entityid }, !entityid ? 'error' : '')}
                  fields={formFields}
                />
              </Form.Item>
            }
            { // 表单中的人员
              (reportrelation.value.type * 1) === 3 &&
              <Form.Item
                validateStatus={item.reportrelation.validateStatus}
                help={item.reportrelation.validateStatus === 'error' ? '请选择表单用户字段' : ''}
              >
                <SelectField
                  placeholder="请选择表单用户字段"
                  value={item.reportrelation.value.fieldname || undefined}
                  onChange={(fieldname, fieldlabel) => this.handleChange('reportrelation', index, { ...reportrelation.value, fieldname }, !fieldname ? 'error' : '')}
                  fields={userFields}
                />
              </Form.Item>
            }
            {
              <Form.Item
                validateStatus={item.reportrelation.validateStatus}
                help={item.reportrelation.validateStatus === 'error' ? '请选择汇报关系' : ''}
              >
                <SelectField
                  keys="reportrelationid"
                  value={reportrelation.value.id || undefined}
                  placeholder="请选择汇报关系"
                  onChange={(id, fieldlabel) => this.handleChange('reportrelation', index, { ...reportrelation.value, id }, !id ? 'error' : '')}
                  fields={reportrelationList}
                />
              </Form.Item>
            }
          </div>
        )
      default:
        return <div>请选择传阅方式</div>
    }
  }

  render() {
    const { flowEntities, flowId, confimloading } = this.props
    const { list, visible, activeKey, index: idx, AllExpend } = this.state

    return (
      <Form>
        <div className={styles.headers}>
          <Button onClick={this.addItem}>添加规则</Button>
          {
            list.length ? (<span>
              <Button onClick={this.allSave} loading={confimloading}>全部保存</Button>
              <Button onClick={this.toggleAllExpend}>{AllExpend ? '全部折叠' : '全部展开'}</Button>
            </span>) : null
          }
        </div>
        <Collapse activeKey={activeKey} onChange={this.handleChangeActiveKey}>
          {
            list.length ? list.map((item, index) => {
              return (
                <Panel className={styles.Panel} header={this.genTitle(item, index)} key={`${index}`}>
                  {this.genChildren(item, index)}
                </Panel>
              )
            }) : <div className={styles.tips}>请添加规则</div>
          }
        </Collapse>
        <FlowBranchConditionModal
          title="配置规则"
          isNotify
          visible={visible}
          record={list[idx]}
          editingPath={{}}
          flowEntities={flowEntities}
          flowId={flowId}
          save={this.handleOkModal.bind(this, idx)}
          cancel={this.handleCancelModal}
        />
      </Form>
    )
  }
}

export default connect(
  state => state[NAMESPACE],
  dispatch => {
    return {
      Init(flowId) {
        dispatch({ type: `${NAMESPACE}/Init`, payload: { flowId } })
      },
      QueryList(action) {
        dispatch({ type: `${NAMESPACE}/QueryList`, payload: { action } })
      },
      SaveList(params) {
        dispatch({ type: `${NAMESPACE}/SaveList`, payload: { params } })
      }
    }
  }
)(WorkflowNotify);
