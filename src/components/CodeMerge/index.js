import React, { PropTypes, Component } from 'react';
import { Modal } from 'antd';
import styles from './CodeMerge.less';

window.JSHINT = require('./jshint').JSHINT;
const CodeMirror = require('codemirror');
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/javascript-lint');
require('codemirror/addon/merge/merge');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/css/css');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/lint/lint.css');
require('codemirror/addon/merge/merge.css');

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

class CodeMerge extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  static defaultProps = {
    style: {},
    // value: '',
    onChange: () => {},
    readOnly: false
  };

  textAreaNode = null;
  codeMirror = null;

  constructor(props) {
    super(props);
    this.state = {
      options: {
        value: '',
        origLeft: null,
        origRight: 'text',
        orig: 'text',
        lineNumbers: true,
        mode: 'javascript',
        highlightDifferences: true,
        connect: 'align',
        collapseIdentical: false,
        gutters: ['CodeMirror-lint-markers'],
        lint: true,
        ...props.options
      }
    };
  }

  componentDidMount() {
    const { options } = this.state;

    if (this.textAreaNode) this.codeMirror = CodeMirror.MergeView(this.textAreaNode, options);
    console.log(this.codeMirror);
    this.codeMirror.editor().on('change', this.handleContentChange);
    this.codeMirror.editor().on('keyup', this.handleKeyUp);
    this.codeMirror.editor().setValue(options.value || '');
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.codeMirror && 
      this.codeMirror.editor() &&
      nextProps.options.value !== this.props.options.value &&
      normalizeLineEndings(this.codeMirror.editor().getValue()) !== normalizeLineEndings(nextProps.options.value)
    ) {
      this.codeMirror.editor().setValue(nextProps.options.value);
    }
    if (nextProps.options.readOnly !== this.props.options.readOnly) {
      this.codeMirror.editor().setOption('readOnly', nextProps.readOnly ? 'nocursor' : false);
    }
  }

  handleContentChange = (cm, change) => {
    const { onChange } = this.props;

    if (onChange && change.origin !== 'setValue') {
      onChange(cm.getValue(), change);
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

  setOption = (key, value) => {
    const { options } = this.state;
    this.setState({ options: { ...options, [key]: value } });
  }

  formBeforeAddEditForm = () => {
    const { len, flag } = this.props;
    return (
      <div className={styles.before}>
        <div style={{ width: `calc(50% + ${30}px)`, fontWeight: 600 }}>{len === 2 ? (flag ? flag[0] : 'select one') : '当前编辑内容'}</div>
        <div style={{ width: `calc(50% - ${30}px)`, fontWeight: 600 }}>{len === 2 ? (flag ? flag[1] : 'select tow') : '所选记录内容'}</div>
      </div>
    );
  }

  handleOk = () => {
    const { onOk } = this.props;
    if (onOk) onOk();
    this.handleCancel();
  }

  handleCancel = () => {
    const { cancel } = this.props;
    if (cancel) cancel();
  }

  render() {
    const { title = '内容差异对比', width = 1050, visible = false, style } = this.props;

    return (
      <Modal
        title={title}
        width={width}
        visible={!!visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        {this.formBeforeAddEditForm()}
        <div ref={ref => this.textAreaNode = ref} style={{ marginBottom: -15, ...style }} />
      </Modal>
    );
  }
}

export default CodeMerge;
