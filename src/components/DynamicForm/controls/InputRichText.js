import React, { PropTypes, Component } from 'react';
import UMEditor from '../../UMEditor';

class InputRichText extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.number,
    maxLength: PropTypes.number
  };
  static defaultProps = {};

  umEditor = null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.umEditor && this.umEditor.setContent(this.props.value || '');
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.umEditor && this.umEditor.setContent(nextProps.value || '');
    }
  }

  onContentChange = (val) => {
    this.setState({ editorContent: val });
  };

  onBlur = () => {
    this.props.onChange(this.umEditor.editor.getContent());
  };

  render() {
    return (
      <div>
        <UMEditor
          ref={editor => this.umEditor = editor}
          style={{ width: '100%', height: '350px' }}
          initialValue={this.props.value}
          onChange={this.onContentChange}
          onBlur={this.onBlur}
          disabled={this.props.isReadOnly === 1}
          mode="simple"
          useImageBase64
        />
      </div>
    );
  }
}

InputRichText.View = ({ value }) => {
  return <div dangerouslySetInnerHTML={{ __html: value || '' }} />
};

export default InputRichText;
