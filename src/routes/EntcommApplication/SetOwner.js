import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message } from 'antd';
import UserSelectModal from '../../components/DynamicForm/controls/UserSelectModal';

class SetOwner extends Component {
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
    const currItems = this.props.currItems;
    if (currentSelected && currentSelected instanceof Array && currentSelected.length === 1) {
      const NewUserId = currentSelected[0].id;
      const RecIds = currItems && currItems instanceof Array && currItems.map(item => item.recid);
      this.props.submit & this.props.submit({
        NewUserId,
        RecIds
      });
    } else {
      message.warning('请选择一个用户将其设置为拥有人');
    }
  };


  render() {
    const { visible, cancel } = this.props;
    return (
      <UserSelectModal visible={visible} multiple={false} onCancel={cancel} onOk={this.handleOk} />
    );
  }
}

export default connect(
  state => {
    const { showModals, currItems } = state.entcommApplication;
    return {
      visible: /setOwner/.test(showModals),
      currItems: currItems
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommApplication/showModals', payload: '' });
      },
      submit(submitData) {
        dispatch({ type: 'entcommApplication/savemailowner', payload: submitData });
      }
    };
  }
)(SetOwner);
