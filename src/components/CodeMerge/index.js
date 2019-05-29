import React, { PropTypes, Component } from 'react';
import { Modal, Button } from 'antd';
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
        origRight: null,
        orig: 'test',
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
    if (this.textAreaNode) this.codeMirror = CodeMirror.MergeView(this.textAreaNode, options); console.log(this.codeMirror);
    // this.codeMirror.on('change', this.handleContentChange);
    // this.codeMirror.on('keyup', this.handleKeyUp);
    // this.codeMirror.setValue(this.props.value || '');
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.codeMirror && 
      nextProps.value !== undefined &&
      nextProps.value !== this.props.value &&
      normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)
    ) {
      this.codeMirror.setValue(nextProps.value);
    }
    if (nextProps.readOnly !== this.props.readOnly) {
      this.codeMirror.setOption('readOnly', nextProps.readOnly ? 'nocursor' : false);
    }
  }

  componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      // this.codeMirror.toTextArea();
    }
  }

  componentWillUpdate() {

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

  setOption = (key, value) => {
    const { options } = this.state;
    this.setState({ options: { ...options, [key]: value } });
  }

  formBeforeAddEditForm = () => {
    const { len } = this.props;
    const { collapseIdentical, connect } = this.state;
    return (
      <div className={styles.before}>
        <div style={{ width: `calc(50% + ${30}px)`, fontWeight: 600 }}>{len === 2 ? 'select one' : '当前内容'}</div>
        <div style={{ width: `calc(50% - ${30}px)`, fontWeight: 600 }}>{len === 2 ? 'select tow' : '原有内容'}</div>
        {/* <Button onClick={() => this.setOption('collapseIdentical', !collapseIdentical)}>collapse</Button>
        <Button onClick={() => this.setOption('connect', connect ? null : 'align')}>connect</Button> */}
      </div>
    );
  }

  handleOk = () => {
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
        visible={visible}
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
