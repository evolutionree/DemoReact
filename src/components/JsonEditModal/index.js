import React, { PropTypes, Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import JsonEditor from '../JsonEditor';

class JsonEditModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      initialJson: '',
      json: '',
      modalKey: new Date().getTime()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.modalVisible && nextProps.modalVisible) {
      this.setState({ initialJson: nextProps.initContent || '{}', json: nextProps.initContent || '{}' });
    } else if (this.props.modalVisible && !nextProps.modalVisible) {
      this.setState({ initialJson: '{}', json: '{}', modalKey: new Date().getTime() });
    }
  }

  render() {
    return (
      <Modal
        key={this.state.modalKey}
        title="JSON Editor"
        width={640}
        visible={this.props.modalVisible}
        onCancel={() => this.props.dispatch({ type: 'powerEdit/editCancel' })}
        onOk={() => this.props.dispatch({ type: 'powerEdit/editSubmit', payload: this.state.json })}
      >
        <JsonEditor
          initialValue={this.state.initialJson}
          onChange={val => this.setState({ json: val })}
        />
      </Modal>
    );
  }
}

export default connect(
  state => state.powerEdit
)(JsonEditModal);
