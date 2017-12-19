import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { EditorState } from 'draft-js';
import styles from './RichEditorInForm.less';
import request from '../utils/request';

class RichEditorInForm extends React.Component {
  static propTypes = {
    initialValue: React.PropTypes.string,
    onChange: React.PropTypes.func,
    useImageBase64: React.PropTypes.bool,
    loading: React.PropTypes.bool,
    token: React.PropTypes.string
  };
  static defaultProps = {
    useImageBase64: false,
    style: { width: '100%', height: '500px' }
  };

  editor = null;

  constructor(props) {
    super(props);
    this.state = {
      id: 'ume-editor-' + new Date().getTime()
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  setContent = (content) => {
    if (this.editor) {
      this.editor.setContent(content);
    } else {
      this.onEditorReady = () => {
        this.editor.setContent(content);
      };
    }
  };

  setHeight = (height) => {
    if (this.editor) {
      this.editor.setHeight(height);
    } else {
      this.onEditorReady = () => {
        this.editor.setHeight(height);
      };
    }
  };

  execCommand = (type, content) => {
    if (this.editor) {
      this.editor.execCommand(type, content);
    } else {
      this.onEditorReady = () => {
        this.editor.execCommand(type, content);
      };
    }
  };

  onContainerDomReady = (container) => {
    const editor = this.editor = UM.getEditor(this.state.id, { x_img_base64: this.props.useImageBase64 });
    this.onEditorReady && this.onEditorReady();
    editor.addListener('contentChange', () => {
      this.props.onChange && this.props.onChange(editor.getContent());
    });
  };

  render() {
    return (
      <Spin spinning={this.props.loading}>
        <div style={{ lineHeight: 'initial' }}>
          <script id={this.state.id} name="content" type="text/plain" style={{ ...this.props.style }} ref={this.onContainerDomReady}></script>
        </div>
      </Spin>
    );
  }
}

export default RichEditorInForm;
