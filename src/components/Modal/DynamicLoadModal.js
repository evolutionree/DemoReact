import React, { PropTypes, Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';

class DynamicLoadModal extends Component {
  static propTypes = {
    modalKey: PropTypes.bool,
    // showModals: PropTypes.string,
    spaceName: PropTypes.string.isRequired,
    WrapComponent: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      key: (new Date()).getTime()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.showModals && nextProps.showModals) {
      this.setState({ key: (new Date()).getTime() });
    }
  }

  render() {
    const { modalKey, spaceName, showModals, WrapComponent } = this.props;
    const { key } = this.state;
    const params = { ...this.props, spaceName, showModals, WrapComponent };
    if (modalKey) return <WrapComponent key={key} {...params} />;
    return <WrapComponent {...params} />;
  }
}

export default connect()(Form.create({
  // mapPropsToFields({ value }) {
  //   return value; // value with errors
  // }
})(DynamicLoadModal));
