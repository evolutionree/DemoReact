import React, { PropTypes, Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import EntcommAddModal from '../../components/EntcommAddModal';

//48a05e80-19be-42a0-b8bb-b1334be0b659
// class UserFeedBackModal extends Component {
//   static propTypes = {};
//   static defaultProps = {};
//
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//
//   render() {
//     return (
//       <div>UserFeedBackModal</div>
//     );
//   }
// }

const UserFeedBackModal = connect(
  state => {
    const { showModals } = state.app;
    return {
      visible: /userFeedBack/.test(showModals),
      entityId: '48a05e80-19be-42a0-b8bb-b1334be0b659',
      modalTitle: '用户反馈'
    };
  },
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'app/showModals', payload: '' });
      },
      done: () => {
        dispatch({ type: 'app/showModals', payload: '' });
        message.success('反馈成功，谢谢您的反馈信息！', 3);
      }
    };
  }
)(EntcommAddModal);

export default UserFeedBackModal;
