import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col, Button } from 'antd';
import EntitySelect from './EntitySelect';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../../../components/FilterConfigBoard';

class RoleRule extends Component {
  static propTypes = {
    entities: PropTypes.arrayOf(PropTypes.shape({
      entityid: PropTypes.string,
      entityname: PropTypes.string
    })).isRequired,
    currEntity: PropTypes.string.isRequired,
    ruleDetail: PropTypes.object,
    fields: PropTypes.array.isRequired
  };
  static defaultProps = {
    ruleDetail: {}
  };

  constructor(props) {
    super(props);
    const { ruleList, ruleSet } = parseRuleDetail(props.ruleDetail);
    this.state = {
      ruleList,
      ruleSet
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.ruleDetail !== nextProps.ruleDetail) {
      const { ruleList, ruleSet } = parseRuleDetail(nextProps.ruleDetail);
      this.setState({
        ruleList,
        ruleSet
      });
    }
  }

  parseRuleDetail = ruleDetail => {
    if (!ruleDetail.ruleset) {
      return {
        ruleList: [],
        ruleSet: ''
      };
    }
    const ruleSet = ruleDetail.ruleset.ruleset;
    const ruleList = [];
    ruleDetail.ruleitems.forEach(item => {
      if (!item.fieldid || !item.operate || !item.ruledata || item.ruletype === undefined) return;
      const rule = {
        fieldId: item.fieldid,
        operator: item.operate,
        ruleData: item.ruledata,
        ruleType: item.ruletype
      };
      ruleList.push(rule);
    });
    return {
      ruleSet,
      ruleList
    };
  };

  selectEntity = entityId => {
    this.props.dispatch({
      type: 'roleRule/selectEntity',
      payload: entityId
    });
  };

  saveRule = () => {
    const result = this.filterConfigBoard.validate();
    if (!result) return;
    this.props.dispatch({
      type: 'roleRule/saveRule',
      payload: {
        ruleList: this.state.ruleList,
        ruleSet: this.state.ruleSet
      }
    });
  };

  render() {
    const { entities, currEntity, fields } = this.props;
    const { ruleList, ruleSet } = this.state;

    const btnStyle = {
      position: 'absolute',
      right: '10px',
      top: '10px'
    };

    return (
      <div>
        <Row gutter={10}>
          <Col span={6}>
            <EntitySelect
              value={currEntity}
              entities={entities}
              onChange={this.selectEntity}
            />
          </Col>
          <Col span={18}>
            <div>数据权限规则</div>
            {this.props.checkFunc('RoleAuthEdit') && <Button onClick={this.saveRule} style={btnStyle}>保存</Button>}
            <FilterConfigBoard
              entityId={currEntity}
              ref={filterConfigBoard => { this.filterConfigBoard = filterConfigBoard; }}
              allFields={fields}
              title1="第一步：定义规则"
              title2="第二步：定义集合规则"
              ruleList={ruleList}
              ruleSet={ruleSet}
              onRulesChange={val => this.setState({ ruleList: val })}
              onRuleSetChange={val => this.setState({ ruleSet: val })}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect(
  state => state.roleRule
)(RoleRule);

