import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';
import classnames from 'classnames';
import PowerTextArea from '../../PowerTextArea';
import { checkIsDev } from '../../../utils';
import InputRichText from './InputRichText';

const TextAreaComponent = checkIsDev() ? PowerTextArea : Input.TextArea;

class InputTextarea extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      innerVal: (value instanceof Object) ? JSON.stringify(value) : value
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      const value = nextProps.value;
      this.setState({ innerVal: (value instanceof Object) ? JSON.stringify(value) : value });
    }
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  onInputChange = event => {
    const val = event.target.value;
    this.setState({ innerVal: val });
  };

  onInputBlur = event => {
    const val = event.target.value;
    this.props.onChange(val);
  };

  render() {
    const { value, isReadOnly, maxLength, isTable, textType } = this.props;
    if (!isTable && textType === 1) { // 富文本
      return (
        <InputRichText {...this.props} />
      );
    }
    return (
      <div className={classnames({ 'input-table-view': isTable })}>
        <TextAreaComponent
          value={this.state.innerVal}
          onChange={this.onInputChange}
          onBlur={this.onInputBlur}
          disabled={isReadOnly === 1}
          maxLength={maxLength}
          autosize={isTable ? { minRows: 1, maxRows: 5 } : { minRows: 4, maxRows: 20 }}
        />
      </div>
    );
  }
}

function onLinkClick(url) {
  const openUrl = url.indexOf('http') !== 0 ? `http://${url}` : url;
  // 打开新页面
  window.open(openUrl);
}

InputTextarea.View = (props) => {
  const { value, value_name, textType, width, fieldname } = props;

  if (textType === 1) return <InputRichText.View value={value} />;

  const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
  let text = value_name !== undefined ? value_name : value;
  if (text === null || text === undefined) {
    text = emptyText;
  } else if (value instanceof Object) {
    text = JSON.stringify(text);
  } else {
    text += '';
    text = text.split('\n').reduce((result, line) => {
      return [
        ...result,
        line,
        <br />
      ];
    }, []);
    text.pop();
  }

  const title = text && text.toString() && text.toString().replace(/\[object Object\],/g, '');
  const isLink = fieldname === 'effect' && title && (title.indexOf('http') === 0 || title.indexOf('www') === 0);
  const style = {};
  if (width) Object.assign(style, { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width });
  if (isLink) Object.assign(style, { color: '#3398db', cursor: 'pointer' });
  
  return (
    <div
      style={style}
      title={title}
      onClick={isLink ? () => onLinkClick(title) : undefined}
    >
      {text}
    </div>
  );
};

export default InputTextarea;

