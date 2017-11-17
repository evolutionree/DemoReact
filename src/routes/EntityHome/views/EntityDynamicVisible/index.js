import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import FilterConfigBoard from '../../../../components/FilterConfigBoard';

class EntityDynamicVisible extends Component {
  static propTypes = {
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleRulesChange = ruleList => {
    this.props.dispatch({ type: 'entityDynamicVisible/ruleList', payload: ruleList });
  };

  handleRuleSetChange = ruleSet => {
    this.props.dispatch({ type: 'entityDynamicVisible/ruleSet', payload: ruleSet });
  };

  handleSave = () => {
    const result = this.filterConfigBoard.validate();
    if (!result) return;
    this.props.dispatch({ type: 'entityDynamicVisible/save' });
  };

  render() {
    const btnStyle = {
      position: 'absolute',
      right: '-80px',
      top: '0'
    };
    return (
      <div style={{ position: 'relative', width: '600px' }}>
        <Button onClick={this.handleSave} style={btnStyle}>保存</Button>
        <FilterConfigBoard
          entityId={this.props.relEntityId}
          ref={filterConfigBoard => { this.filterConfigBoard = filterConfigBoard; }}
          allFields={this.props.relFields}
          ruleList={this.props.ruleList}
          ruleSet={this.props.ruleSet}
          onRulesChange={this.handleRulesChange}
          onRuleSetChange={this.handleRuleSetChange}
        />
      </div>
    );
  }
}

export default connect(
  state => state.entityDynamicVisible
)(EntityDynamicVisible);
