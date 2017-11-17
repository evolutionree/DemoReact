import React, { PropTypes, Component } from 'react';
import 'jsoneditor/dist/jsoneditor.min.css';
import JSONEditor from 'jsoneditor';

class JsonEditor extends Component {
  static propTypes = {
    initialValue: PropTypes.string,
    onChange: PropTypes.func
  };
  static defaultProps = {
    initialValue: '{}'
  };

  editorContainer = null;
  editor = null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const options = {
      modes: ['tree', 'code', 'form', 'text', 'view'],
      onChange: this.handleEditorChange
    };
    this.editor = new JSONEditor(this.editorContainer, options);
    this.setEditorText(this.props.initialValue);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initialValue !== nextProps.initialValue) {
      this.setEditorText(nextProps.initialValue);
    }
  }

  setEditorText = text => {
    try {
      this.editor.setText(text);
    } catch (e) {
      console.error('setEditorText', e);
      this.editor.set(null);
    }
  };

  handleEditorChange = () => {
    this.props.onChange(this.editor.getText());
  };

  render() {
    const containerStyle = {
      width: '100%',
      height: '600px'
    };
    return (
      <div ref={ref => this.editorContainer = ref} style={containerStyle} />
    );
  }
}

export default JsonEditor;
