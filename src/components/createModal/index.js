import React from 'react';
import { connect } from 'dva';

// state:
// {
//   modalManage: {
//     inRequestModal: '', // 请求显示modal
//     currModal: '' // modalName
//   }
// }

const nameSpace = 'modalManage';

function createModal({
  modalName,
  shouldOpen,
  willOpen
}) {
  if (typeof modalName !== 'string') {
    throw new Error('require modalName of string type');
  }
  if (shouldOpen !== undefined && typeof shouldOpen !== 'function') {
    throw new Error('shouldOpen 必须是一个方法');
  }
  if (willOpen !== undefined && typeof willOpen !== 'function') {
    throw new Error('willOpen 必须是一个方法');
  }

  return function inManage(WrappedModal) {
    class InManage extends React.Component {
      static propTypes = {
        dispatch: React.PropTypes.func,
        inRequestModal: React.PropTypes.string,
        currModal: React.PropTypes.string,
        globalState: React.PropTypes.object
      };
      static defaultProps = {};

      constructor(props) {
        super(props);
        this.state = {
          visible: modalName === props.currModal,
          resolves: {}
        };

        if (this.state.visible && willOpen) {
          willOpen({
            state: props.globalState,
            resolve: this.willOpenResolve
          });
        }
      }

      componentWillReceiveProps(nextProps) {
        const isRequsetOpen = this.props.currModal !== modalName
          && nextProps.currModal === modalName;
        // const isRequestClose = this.props.currModal === modalName
        //   && nextProps.currModal !== modalName;
        if (isRequsetOpen && shouldOpen !== undefined) {
          if (shouldOpen(nextProps.globalState)) {
            this.setState({ visible: true });
            willOpen && willOpen({
              state: nextProps.globalState,
              resolve: this.willOpenResolve
            });
          } else {
            this.props.dispatch(rejectModal(modalName));
          }
        } else if (nextProps.currModal !== modalName) {
          this.setState({
            visible: false,
            resolves: {}
          });
        }
      }

      willOpenResolve = data => {
        this.setState({
          resolves: {
            ...this.state.resolves,
            ...data
          }
        });
      };

      handleClose = () => {

      };

      handleCancel = () => {
        this.props.dispatch(hideModal());
      };

      render() {
        return (
          <WrappedModal
            visible={this.state.visible}
            close={this.handleClose}
            cancel={this.handleCancel}
            {...this.props}
            {...this.state.resolves}
          />
        );
      }
    }

    const wrappedModalName = WrappedModal.displayName
      || WrappedModal.name
      || 'Component';

    InManage.displayName = `inManage(${wrappedModalName})`;
    return connect(
      function mapStateToProps(state, ownProps) {
        return {
          ...state[nameSpace],
          globalState: state
        };
      },
      // function mapDispatchToProps(dispatch, ownProps) {
      //
      // }
    )(InManage);
  };
}

function hideModal() {
  return {
    type: `${nameSpace}/hideModal`
  };
}
export function requestModal(modalName) {
  return {
    type: `${nameSpace}/requestModal`,
    payload: modalName
  };
}
function rejectModal(modalName) {
  return {
    type: `${nameSpace}/rejectModal`,
    payload: modalName
  };
}


export default createModal;
