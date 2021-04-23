import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Checkbox } from 'antd';
import { connect } from 'dva';
import { queryFields } from '../../services/entity';
import { queryBranchRule, saveWorkflowVisibleRule } from '../../services/workflow';
import { updatePrintTemplates } from '../../services/printTemplate';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../components/FilterConfigBoard';

class TemplateRuleModal extends Component {
  static propTypes = {
    currentItem: PropTypes.object,
    visible: PropTypes.bool,
    close: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      ruleList: [],
      ruleSet: '',
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
          this.fetchRulesData()
        ]).then(([fields, ruleDetail]) => {
          this.setState({ loading: false });
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
      ruleList: [],
      ruleSet: '',
      loading: false,
      confirmLoading: false
    });
  };

  fetchEntityFields = () => {
    const { entityid } = this.props.currentItem;
    return queryFields(entityid).then(result => {
      return result.data.entityfieldpros.map(item => ({
        controlType: item.controltype,
        fieldId: item.fieldid,
        fieldLabel: item.fieldlabel,
        fieldConfig: item.fieldconfig,
        recStatus: item.recstatus
      }));
    });
  };

  fetchRulesData = () => {
    if (!this.props.currentItem.ruleid) return Promise.resolve();
    return queryBranchRule(this.props.currentItem.ruleid).then(result => {
      return result.data[0];
    });
  };

  handleSubmit = () => {
    const result = this.filterConfigBoard.validate();
    if (!result) return;
    const { ruleList, ruleSet, fields } = this.state;
    const entityid = this.props.currentItem.entityid;
    const params = {
      typeid: 5,
      rulename: '',
      // flowid: this.props.currentItem.flowid,
      ruleid: this.props.currentItem.ruleid || undefined,
      id: this.props.currentItem.ruleid || undefined,
      entityid: entityid,
      ruleset: {
        ruleset: ruleSet,
        userid: 0,
        ruleformat: ''
      },
      ruleitems: ruleListToItems(ruleList, fields, entityid)
    };
    this.setState({ confirmLoading: true });
    saveWorkflowVisibleRule(params).then(result => {
      const currentItems = this.props.currentItem;
      const exportconfig = currentItems.exportconfig;
      return updatePrintTemplates({
        ...currentItems,
        exportconfig: JSON.stringify(exportconfig),
        ruleid: result.data
      });
    }).then(result => {
      this.setState({ confirmLoading: false });
      message.success('保存成功');
      this.props.close(true);
    }).catch(error => {
      this.setState({ confirmLoading: false });
      message.error(error.message || '保存失败');
    });
  };

  render() {
    const { currentItem, close } = this.props;
    const { fields, ruleList, ruleSet, confirmLoading, loading } = this.state;
    return (
      <Modal
        visible={this.props.visible}
        title={`模板适用范围 -- ${currentItem && currentItem.templatename}`}
        onOk={this.handleSubmit}
        onCancel={close}
        confirmLoading={confirmLoading}
      >
        <Spin spinning={loading}>
          <FilterConfigBoard
            entityId={currentItem && currentItem.entityid}
            ref={filterConfigBoard => { this.filterConfigBoard = filterConfigBoard; }}
            allFields={fields}
            title1="第一步：定义数据规则"
            title2="第二步：定义集合规则"
            ruleList={ruleList}
            ruleSet={ruleSet}
            onRulesChange={val => this.setState({ ruleList: val })}
            onRuleSetChange={val => this.setState({ ruleSet: val })}
          />
        </Spin>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, currentItems } = state.printTemplate;
    return {
      visible: /templateRule/.test(showModals),
      currentItem: currentItems[0]
    };
  },
  dispatch => {
    return {
      close(isSuccess) {
        dispatch({ type: 'printTemplate/showModals', payload: '' });
        if (isSuccess === true) {
          dispatch({ type: 'printTemplate/queryList' });
        }
      }
    };
  }
)(TemplateRuleModal);
