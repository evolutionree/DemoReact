import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import EntitySelect from './EntitySelect';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../../../components/FilterConfigBoard';
import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';
import styles from './styles.less';

const height = document.body.offsetHeight - (60 + 48 + 36 + 68); // 184 为其他组件占的总高度

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
      ruleSet,
      keyword: '',
      entities: props.entities
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
    this.setState({ entities: nextProps.entities });
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

  onSearch = (keyword) => {
    const { entities: PropList } = this.props;
    const { entities: list } = this.state;

    const entities = !keyword ? PropList : list.filter(item => getIntlText('entityname', item).includes(keyword));
    this.setState({ keyword, entities });
  }

  render() {
    const { currEntity, fields } = this.props;
    const { ruleList, ruleSet, keyword, entities } = this.state;

    return (
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.box}>
            <div className={styles.leftContent}>
              <div className={styles.subtitle}>目录</div>
              <EntitySelect
                height={height}
                keyword={keyword}
                onSearch={this.onSearch}
                value={currEntity}
                entities={entities}
                onChange={this.selectEntity}
              />
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.box}>
            <div className={styles.rightContent} style={{ height, overflowY: 'auto' }}>
              <div className={styles.subtitle}>数据权限规则</div>
              {this.props.checkFunc('RoleAuthEdit') && <Button onClick={this.saveRule} className={styles.btnStyle}>保存</Button>}
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.roleRule
)(RoleRule);

