import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col, Button } from 'antd';
import * as _ from 'lodash';
import FunctionsSelect from './FunctionsSelect';
import FunctionRuleModal from './FunctionRuleModal';

class VocationRule extends Component {
  static propTypes = {
    selectedFuncs: PropTypes.object,
    allFunctions: PropTypes.array,
    vocationId: PropTypes.string
  };
  static defaultProps = {
    allFunctions: [],
    vocationId: null
  };


  constructor(props) {
    super(props);
    const { selectedFuncs, allFunctions, vocationId } = this.props;
    this.state = {
      selectedFuncs,
      allFunctions,
      vocationId
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selectedFuncs, allFunctions, vocationId } = nextProps;
    this.setState({
      selectedFuncs,
      allFunctions,
      vocationId
    });
  }
  handleChange = (values, nodes) => {
    this.setState({
      selectedFuncs: values
    });
    this.props.dispatch({
      type: 'vocationRule/putState',
      payload: {
        selectedFuncs: values
      }
    });
  };
  // getAllHidenFunctions = () => {
  //   const thisAllFuncs = this.state.allFunctions;
  //   const thisSelectedFuncs = this.state.selectedFuncs.checked;
  //   const idAllFuncs = thisAllFuncs.map(item => item.funcid);
  //   thisAllFuncs.forEach(function (item) {
  //     item.isSelected = 0;
  //   });
  //   thisSelectedFuncs.forEach(function(item) {
  //     const index = idAllFuncs.indexOf(item);
  //     if (index >= 0) {
  //       const item2 = thisAllFuncs[index];
  //       item2.isSelected = 1;
  //     }
  //   });
  //   while (true) {
  //     let hasChangedData = false;
  //     thisAllFuncs.forEach(function(item) {
  //       const index = idAllFuncs.indexOf(item.ancestor);
  //       if (index >= 0) {
  //         const item5 = thisAllFuncs[index];
  //         if (item5.isSelected === 0) {
  //           item5.isSelected = 1;
  //           hasChangedData = true;
  //         }
  //       }
  //     });
  //     if (hasChangedData === false) {
  //       break;
  //     }
  //   }
  //
  //   while (true) {
  //     let hasChangedData = false;
  //     thisAllFuncs.forEach(function(item) {
  //       if (item.isSelected === 0) return;
  //       const allChildren = thisAllFuncs.filter((item2) => {
  //         return item2.ancestor === item.funcid;
  //       });
  //       if (allChildren === null || allChildren.length === 0) {
  //         return;
  //       }
  //       const allSelectedChildren = allChildren.filter((item3) => (item3.isSelected === 1));
  //       if (allSelectedChildren === null || allSelectedChildren.length === 0) {
  //         item.isSelected = 0;
  //         hasChangedData = true;
  //       }
  //     });
  //     if (hasChangedData === false) {
  //       break;
  //     }
  //   }
  //   const hiddenFuncs = thisAllFuncs.filter(item4 => (item4.isSelected === 0));
  //   return hiddenFuncs;
  // };
  getAllHidenFunctions = () => {
    return this.props.allFunctions
      .filter(item => !_.includes(this.props.selectedFuncs.checked, item.funcid));
  };
  handleSubmit = () => {
    const hiddenFuncs = this.getAllHidenFunctions();
    const functionjson = hiddenFuncs.map(item => {
      return {
        functionid: item.funcid,
        ParentId: item.ancestor || '00000000-0000-0000-0000-000000000000',
        FunctionCode: item.funccode
      };
    }
      );
    const { vocationId } = this.props;
    const params = {
      vocationid: vocationId,
      functionjson
    };
    this.props.dispatch({
      type: 'vocationRule/saveVocationRule',
      payload: params
    });
  };

  handleEditFunc = func => {
    this.props.dispatch({
      type: 'vocationRule/putState',
      payload: {
        currFunction: func
      }
    });
  };

  render() {
    const { selectedFuncs } = this.state;

    return (
      <div>
        <Row gutter={10}>
          <Col span={12}>
            <div>功能权限分配&nbsp;&nbsp;&nbsp;&nbsp;<Button onClick={this.handleSubmit} >保存功能</Button></div>
            <FunctionsSelect
              functions={this.props.allFunctions}
              checkable
              checkedKeys={selectedFuncs}
              onCheckChange={this.handleChange}
              onEditFunc={this.handleEditFunc}
              checkStrictly
            />
          </Col>
          <Col span={12}>
            <div />

          </Col>
        </Row>
        <FunctionRuleModal />
      </div>
    );
  }
}

export default connect(
  state => state.vocationRule
)(VocationRule);

