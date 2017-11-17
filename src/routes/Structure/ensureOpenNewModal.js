import React, { PropTypes, Component } from 'react';

/**
 * 当visible变为true时，触发控件重新渲染
 * @param WrappedModalComponent
 * @returns {EnsureOpenNewModal}
 */
function ensureOpenNewModal(WrappedModalComponent) {
  return class EnsureOpenNewModal extends Component {
    static propTypes = {
      visible: PropTypes.bool
    };
    static defaultProps = {
      visible: false
    };

    constructor(props) {
      super(props);
      this.state = {
        key: new Date().getTime()
      };
    }

    componentWillReceiveProps(nextProps) {
      if (!this.props.visible && nextProps.visible) {
        this.setState({ key: new Date().getTime() });
      }
    }

    render() {
      return (
        <WrappedModalComponent key={this.state.key} {...this.props} />
      );
    }
  };
}

export default ensureOpenNewModal;
