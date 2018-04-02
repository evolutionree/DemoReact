import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import { controlMap } from '../../../../components/DynamicModal/constants';

class DynamicModal extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  handleOk = (currentSelected) => {
    // const currItems = this.props.currItems;
    // const NewUserId = currentSelected[0].id;
    // const RecIds = currItems && currItems instanceof Array && currItems.map(item => item.recid);
    // this.props.submit & this.props.submit({
    //   NewUserId,
    //   RecIds
    // });
    const app = this;
    const dynamicModalData = this.props.dynamicModalData;
    const expandJS = dynamicModalData && dynamicModalData.extradata && dynamicModalData.extradata.expandJS;
    eval(expandJS);
  };


  render() {
    const dynamicModalData = this.props.dynamicModalData;
    const controlType = dynamicModalData && dynamicModalData.extradata && dynamicModalData.extradata.componentType;
    const props = {
      visible: this.props.visible,
      onCancel: this.props.cancel,
      onOk: this.handleOk,
      ...this.props
    }
    let ControlComponent = controlMap[controlType];
    if (!ControlComponent) {
      return null;
    }

    return React.createElement(ControlComponent, props);
  }
}

export default connect(
  state => {
    const { showModals, currItems, dynamicModalData } = state.entcommRel;
    return {
      visible: /dynamicModal/.test(showModals),
      currItems: currItems,
      dynamicModalData: dynamicModalData
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommRel/showModals', payload: '' });
      },
      submit(submitData) {
        dispatch({ type: 'entcommRel/dynamicModalSendData', payload: submitData });
      }
    };
  }
)(DynamicModal);
