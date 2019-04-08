import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Checkbox } from 'antd';
import { connect } from 'dva';
import { queryFields } from '../../../../services/entity';
import { getreltabrule, savereltabrule } from '../../../../services/functions';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../../../components/FilterConfigBoard';

class FunctionRuleModal extends Component {
  static propTypes = {
    currFunction: PropTypes.object,
    visible: PropTypes.bool,
    close: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      rawRuleData: null,
      ruleList: [],
      ruleSet: '',
      syncDevice: false,
      loading: false,
      confirmLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.setState({
        loading: true
      }, () => {
        Promise.all([
          this.fetchEntityFields(),
          this.fetchFunctionRules()
        ]).then(([fields, ruleDetail]) => {
          this.setState({ loading: false, rawRuleData: ruleDetail });
          const { ruleList, ruleSet } = parseRuleDetail(ruleDetail);
          this.setState({
            fields,
            ruleList,
            ruleSet
          });
        }, error => {
          this.setState({ loading: false });
          message.error(error.message);
        });
      });
    } else if (isClosing) {
      this.resetState();
    }
  }

  resetState = () => {
    this.setState({
      fields: [],
      rawRuleData: null,
      ruleList: [],
      ruleSet: '',
      syncDevice: false,
      loading: false,
      confirmLoading: false
    });
  };

  fetchEntityFields = () => {
    const { currFunction } = this.props;
    const { entityid } = currFunction;
    return queryFields(entityid).then(result => {
      const entityfieldpros = result.data && Array.isArray(result.data.entityfieldpros) && result.data.entityfieldpros.length && result.data.entityfieldpros;
      if (entityfieldpros) {
        return entityfieldpros.map(item => ({
          controlType: item.controltype,
          fieldId: item.fieldid,
          fieldLabel: item.fieldlabel,
          fieldConfig: item.fieldconfig,
          recStatus: item.recstatus
        }));
      } else {
        return [];
      }
    });
  };

  fetchFunctionRules = () => {
    const { currFunction } = this.props;
    const { relid: RelTabId, entityid } = currFunction;
    const params = { entityid, RelTabId };
    return getreltabrule(params).then(result => {
      return Array.isArray(result.data) && result.data.length && result.data[0];
    });
  };

  /**
 * 保存function数据规则
 * @param params
 * {
    roleid:"",
    FunctionId:"",
    entityid:"",
    rule:
    {
        "entityid":"",
        "RuleName":"",
        "RuleSql":"",
        "RuleId":null
    },
    "ruleset":{"ruleset":"$1","userid":0,"ruleformat":""},
    "ruleitems":[]
    }
 * @returns {Promise.<Object>}
 */
  handleSubmit = () => {
    const result = this.filterConfigBoard.validate();
    if (!result) return;
    const { ruleList, ruleSet, fields, rawRuleData } = this.state;
    const { currFunction } = this.props;
    const { relid: RelTabId, entityid } = currFunction;
    const params = {
      RelTabId,
      entityid,
      rule: {
        entityid,
        rulename: '',
        rulesql: '',
        ruleid: rawRuleData ? rawRuleData.ruleid : null
      },
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      },
      syncDevice: this.state.syncDevice ? 1 : 0,
      ruleitems: ruleListToItems(ruleList, fields, entityid)
    };
    this.setState({ confirmLoading: true });
    savereltabrule(params).then(result => {
      this.setState({ confirmLoading: false });
      message.success('保存成功');
      this.props.close();
    }, error => {
      this.setState({ confirmLoading: false });
      message.error(error.message || '保存失败');
    });
  };

  render() {
    const { currFunction, close } = this.props;
    const { fields, ruleList, ruleSet, syncDevice, confirmLoading, loading } = this.state;

    return (
      <Modal
        visible={this.props.visible}
        title={`可操作数据权限配置 -- ${currFunction && currFunction.relname}`}
        onOk={this.handleSubmit}
        onCancel={close}
        confirmLoading={confirmLoading}
      >
        <Spin spinning={loading}>
          <FilterConfigBoard
            entityId={currFunction && currFunction.entityid}
            ref={filterConfigBoard => { this.filterConfigBoard = filterConfigBoard; }}
            allFields={fields}
            title1="第一步：定义数据规则"
            title2="第二步：定义集合规则"
            ruleList={ruleList}
            ruleSet={ruleSet}
            onRulesChange={val => this.setState({ ruleList: val })}
            onRuleSetChange={val => this.setState({ ruleSet: val })}
          />
          {/* <div style={{ marginTop: '10px' }}>
            <Checkbox
              checked={syncDevice}
              onClick={evt => { this.setState({ syncDevice: evt.target.checked }); }}
            >
              同步规则到WEB和手机端
            </Checkbox>
          </div> */}
        </Spin>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { entityId, currentItem, showModals } = state.entityTabs;
    const { role } = state.app.user;
    const currFunction = {
      entityid: entityId,
      relid: currentItem ? currentItem.relid : '',
      relname: currentItem ? currentItem.relname : ''
    };

    return {
      currFunction,
      visible: /^rule$/.test(showModals)
    };
  },
  dispatch => {
    return {
      close() {
        dispatch({ type: 'entityTabs/showModals', payload: '' });
      }
    };
  }
)(FunctionRuleModal);
