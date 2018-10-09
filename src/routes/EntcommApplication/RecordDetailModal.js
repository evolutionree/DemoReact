import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import EntcommDetailModal from '../../components/EntcommDetailModal';
import { getFunctionbutton } from '../../services/entcomm';
const style = { display: 'inline-block', marginLeft: '6px' };
const RecordDetailModal = WrappedComponent => {
  class RecordDetail extends Component {
    componentWillReceiveProps(nextProps) {
      const isOpening = !this.props.visible && nextProps.visible;
      const isClosing = this.props.visible && !nextProps.visible;
      if (isOpening) {
        const { entityId, recordId } = nextProps;
        getFunctionbutton({ entityid: entityId, RecIds: [recordId] }).then((result) => {
          let { data: functionbutton } = result;
          this.props.functionButton_category(functionbutton);
        });
      }
    }

    extraToolBarClickHandler = (item) => {
      this.props.onExtraToolbarClick && this.props.onExtraToolbarClick(item);
    }
    extraBtnClickHandler = (item) => {
      this.props.onExtraBtnClick && this.props.onExtraBtnClick(item);
    }

    render() {
      const { extraToolbarData, extraButtonData } = this.props;
      const footer = [
        <ul style={style} key="extraToolbarData">
          {
            extraToolbarData instanceof Array && extraToolbarData.map(item => {
              return <li style={style} key={item.id}><a onClick={this.extraToolBarClickHandler.bind(this, item)}>{item.title}11</a></li>;
            })
          }
        </ul>,
        <ul style={style} key="extraButtonData">
          {
            extraButtonData instanceof Array && extraButtonData.map(item => {
              return <li style={style} key={item.id}><a onClick={this.extraBtnClickHandler.bind(this, item)}>{item.title}</a></li>;
            })
          }
        </ul>,
        <Button key="close" type="default" onClick={this.props.hideModal}>
          关闭
        </Button>
      ];
      return <WrappedComponent {...this.props} footer={footer} />;
    }
  };

  return connect(
    state => {
      const { showModals, entityName, extraToolbarData, extraButtonData } = state.entcommApplication;
      const match = showModals && showModals.match(/recordDetail\?([^:]+):(.+)$/);
      return {
        visible: !!match,
        entityId: match && match[1],
        recordId: match && match[2],
        entityName,
        extraToolbarData: extraToolbarData.filter(item => item.selecttype !== 2),
        extraButtonData
      };
    },
    dispatch => {
      const hideModal = () => {
        dispatch({ type: 'entcommApplication/currItems', payload: [] });
        dispatch({ type: 'entcommApplication/showModals', payload: '' });
      };
      return {
        functionButton_category: (functionbutton) => {
          dispatch({ type: 'entcommApplication/functionButton_category', payload: functionbutton });
        },
        hideModal,
        onCancel() {
          hideModal();
        },
        onOk() {
          hideModal();
        }
      };
    }
  )(RecordDetail);
}
export default RecordDetailModal(EntcommDetailModal);
