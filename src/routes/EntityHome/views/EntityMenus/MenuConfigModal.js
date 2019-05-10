import React from 'react';
import { connect } from 'dva';
import { Modal, Mention, message, Input } from 'antd';
import IntlInput from '../../../../components/UKComponent/Form/IntlInput';
import _ from 'lodash';
import FilterConfigBoard from '../../../../components/FilterConfigBoard';
import { queryFields, queryMenuRule } from '../../../../services/entity';

const { toEditorState } = Mention;

class MenuConfigModal extends React.Component {
  static propTypes = {};
  static defaultTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      menuName: '',
      allFields: [],
      rawRuleInfo: null,
      ruleList: [],
      ruleSet: '',
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      // 刚打开窗口时，清空之前数据
      this.setState({
        menuName: '',
        allFields: [],
        rawRuleInfo: null,
        ruleList: [],
        ruleSet: ''
      });

      this.setState({ loading: true });
      if (nextProps.isEdit) {
        Promise.all([
          this.queryFields(),
          this.queryMenuRule(nextProps.currentItem.menuid)
        ]).then(() => {
          this.setState({ loading: false });
        }).catch(e => {
          this.setState({ loading: false });
          message.error(e.message || '查询数据出错');
        });
      } else {
        this.queryFields().then(() => {
          this.setState({ loading: false });
        }).catch(e => {
          this.setState({ loading: false });
          message.error(e.message || '查询数据出错');
        });
      }
    }
  }

  queryFields = () => {
    return queryFields(this.props.entityId).then(result => {
      const allFields = result.data.entityfieldpros.map(field => ({
        controlType: field.controltype,
        fieldId: field.fieldid,
        fieldLabel: field.fieldlabel,
        fieldConfig: field.fieldconfig,
        recStatus: field.recstatus
      }));
      this.setState({
        allFields
      });
    });
  };

  queryMenuRule = (menuId) => {
    return queryMenuRule(menuId).then(result => {
      const data = result.data[0];
      this.setState({
        menuName: data && (data.menuname_lang || data.menuname),
        ruleList: this.itemsToRuleList(data && data.ruleitems),
        ruleSet: data && data.ruleset.ruleset,
        rawRuleInfo: _.cloneDeep(data)
      });
    });
  };

  onRulesChange = rules => {
    this.setState({ ruleList: rules });
  };

  onRuleSetChange = ruleSet => {
    this.setState({ ruleSet });
  };

  onMenuNameChange = value => {
    this.setState({ menuName: value });
  };

  /**
   * {
      "RuleName":"我创建的规则",
      "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
      "RuleItems":[{
          "itemname":"规则1",
          "entityid":"e0771780-9883-456a-98b9-372d9888e0ac",
          "fieldid":"fc978c06-1dd8-42a0-80a3-28ffdf6dc11c",
          "Operate":"ilike",
          "RuleData":"{\"dataval\":\"12312\"}",
          "ruletype":1,
          "usetype":0,
          "Relation":{
              "userid":0,
              "rolesub":0,
              "paramindex":1
          }
      }],
      "RuleSet":{
          "ruleset":"",
          "userid":0,
          "ruleformat":""
      }
    }
   */
  onConfirm = () => {
    const { entityId, isEdit, currentItem, submit } = this.props;
    const { ruleList, ruleSet, menuName, rawRuleInfo } = this.state;

    if (!menuName) {
      message.error('请输入筛选项名称');
      return;
    }
    if (!ruleList.length || !ruleSet) {
      message.error('请设置筛选规则');
      return;
    }
    if (typeof menuName !== 'object' || Object.values(menuName).some(o => !o)) {
      message.error('请补全筛选项名称');
      return;
    }

    const result = this.filterConfigBoard.validate();
    if (!result) return;
    const params = {
      typeid: 1,
      entityid: entityId,
      menuname_lang: menuName,
      rulename_lang: menuName,
      ruleitems: ruleList.map(this.toRuleItem),
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      }
    };
    if (isEdit) {
      params.ruleid = rawRuleInfo && rawRuleInfo.ruleid;
      params.id = currentItem.menuid;
    }
    submit(params);
  };

  toRuleItem = (rule, index) => {
    const defaultUUID = '00000000-0000-0000-0000-000000000000';
    return {
      itemname: `规则${index + 1}`,
      entityid: this.props.entityId,
      controltype: getControlType(rule.fieldId, this.state.allFields),
      fieldid: rule.fieldId || defaultUUID,
      operate: rule.operator || '',
      ruledata: JSON.stringify(rule.ruleData),
      ruletype: rule.ruleType,
      usetype: 0,
      relation: {
        userid: 0,
        rolesub: 1,
        paramindex: 1
      }
    };
    function getControlType(fieldId, fields) {
      const field = _.find(fields, item => item.fieldId === fieldId);
      return field && field.controlType;
    }
  };

  itemsToRuleList = (items) => {
    const ruleList = [];
    Array.isArray(items) && items.forEach(item => {
      if (item.ruletype === undefined) return;
      if (item.ruletype !== 2 && (!item.fieldid || !item.operate || !item.ruledata)) return;
      if (item.ruletype === 2 && !item.ruledata) return;
      const rule = {
        fieldId: item.fieldid,
        operator: item.operate,
        ruleData: item.ruledata,
        ruleType: item.ruletype
      };
      ruleList.push(rule);
    });
    return ruleList;
  };

  render() {
    const { visible, isEdit, cancel, modalPending } = this.props;
    return (
      <Modal
        width={640}
        maskClosable={false}
        title={isEdit ? '编辑筛选项' : '新增筛选项'}
        visible={visible}
        onOk={this.onConfirm}
        onCancel={cancel}
        confirmLoading={modalPending}
      >
        {this.state.loading ? '加载数据中...' : (
          <div>
            <div>筛选项名称</div>
            <div style={{ margin: '10px 0 20px' }}>
              <IntlInput placeholder="请输入筛选项名称" maxLength={50} value={this.state.menuName} onChange={this.onMenuNameChange} />
            </div>
            <FilterConfigBoard
              entityId={this.props.entityId}
              ref={filterConfigBoard => { this.filterConfigBoard = filterConfigBoard; }}
              allFields={this.state.allFields}
              ruleList={this.state.ruleList}
              ruleSet={this.state.ruleSet}
              onRulesChange={this.onRulesChange}
              onRuleSetChange={this.onRuleSetChange}
            />
          </div>
        )}
      </Modal>
    );
  }
}

export default connect(
  ({ entityMenus }) => {
    const { showModals, currentItem, modalPending, entityId } = entityMenus;
    return {
      visible: /edit|add/.test(showModals),
      isEdit: /edit/.test(showModals),
      currentItem,
      modalPending,
      entityId
    };
  },
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'entityMenus/showModals', payload: '' });
      },
      submit: data => {
        dispatch({ type: 'entityMenus/saveEntityQueryRule', payload: data });
      }
    };
  }
)(MenuConfigModal);
