import React, { PropTypes, Component } from 'react';
import styles from './CodeEditor.less';

window.JSHINT = require('./jshint').JSHINT;
const CodeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/javascript-lint');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/lint/lint.css');

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

class CodeEditor extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    style: PropTypes.object
  };
  static defaultProps = {
    style: {},
    value: '',
    onChange: () => {},
    readOnly: false
  };

  textAreaNode = null;
  codeMirror = null;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const options = {
      lineNumbers: true,
      mode: 'javascript',
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      readOnly: this.props.readOnly ? 'nocursor' : false
    };
    this.codeMirror = CodeMirror.fromTextArea(this.textAreaNode, options);
    this.codeMirror.on('change', this.handleContentChange);
    this.codeMirror.on('keyup', this.handleKeyUp);
    this.codeMirror.setValue(this.props.value || '');
  }

  componentWillReceiveProps(nextProps) {
    if (this.codeMirror && nextProps.value !== undefined && nextProps.value !== this.props.value
      && normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)) {
      this.codeMirror.setValue(nextProps.value);
    }
    if (nextProps.readOnly !== this.props.readOnly) {
      this.codeMirror.setOption('readOnly', nextProps.readOnly ? 'nocursor' : false);
    }
  }

  componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  handleContentChange = (cm, change) => {
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(cm.getValue(), change);
    }
  };

  handleKeyUp = (cm, event) => {
    // 190 when press '.'
    if (event.keyCode === 190) {
      this.handleAutoComplete();
    }
  };

  handleAutoComplete = () => {
    this.codeMirror.showHint({ hint: this.getHint });
  };

  getHint = () => {
    const cm = this.codeMirror;
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const start = cursor.ch;

    const APIs = [
      'alert', 'clearFilter',
      'designateDataSource', 'designateDataSourceByName',
      'designateFilterDataSource', 'designateFilterDataSourceByName', 'designateFilterNodes',
      'designateNode',
      'designateRowFieldDataSource', 'designateRowFieldFilterDataSource', 'designateRowFieldFilterNodes',
      'getCurrentFormID', 'getMainFormID', 'getRowValue', 'getTableHeader', 'getTableRowCount', 'getValue',
      'request',
      'setReadOnly', 'setRequired', 'setRowFieldReadOnly', 'setRowFieldRequired', 'setRowFieldVisible',
      'setRowValue', 'setValue', 'setValueByName', 'setVisible'
    ];

    // if (start && line.charAt(start - 1) === '.') {
    if (start) {
      let matchCase = '';
      let pos = start - 1;
      let ch = line.charAt(pos);
      while (pos >= 0 && /\w|\./.test(ch)) {
        matchCase = ch + matchCase;

        pos -= 1;
        ch = line.charAt(pos);
      }

      const match = matchCase.match(/^app\.(\w*)$/);

      if (match) {
        const word = match[1].toLowerCase();
        const matchAPIs = word
          ? APIs.filter(i => new RegExp('^' + word).test(i.toLowerCase()))
          : APIs;

        return {
          list: matchAPIs,
          from: CodeMirror.Pos(cursor.line, start - word.length),
          to: CodeMirror.Pos(cursor.line, start)
        };
      }
    }

    return null;
  };

  render() {
    return (
      <div style={this.props.style} className={styles.codeEditor}>
        <textarea ref={ref => this.textAreaNode = ref} />
      </div>
    );
  }
}

export default CodeEditor;
