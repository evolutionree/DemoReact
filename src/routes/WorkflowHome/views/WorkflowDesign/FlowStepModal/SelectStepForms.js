import React, { PropTypes, Component } from 'react';
import { Button, Icon } from 'antd';
import GlobalJSModal from './GlobalJSModal'

class SelectStepForms extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  toggleModal = (visible) => this.setState({ visible })

  onCanCel = () => this.toggleModal(false)

  render() {
    const { value, onChange, flowId } = this.props;
    const { visible } = this.state;

    return (
      <div>
        {visible &&
          <GlobalJSModal
            otherParams={{ relrecid: flowId || '' }}
            value={value}
            onChange={onChange}
            visible={visible}
            onOk={this.onCanCel}
            onCancel={this.onCanCel}
          />
        }
        <Button onClick={this.toggleModal.bind(this, true)}>全局脚本{value && <Icon type='check' />}</Button>
      </div>
    );
  }
}

export default SelectStepForms;

