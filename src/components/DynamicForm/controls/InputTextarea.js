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
    let val = event.target.value;
    this.setState({ innerVal: val });
  };

  onInputBlur = event => {
    let val = event.target.value;
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

InputTextarea.View = (props) => {
  const { value, value_name, textType, width } = props;

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

  return (
    <div
      style={width ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width } : null}
      title={text && text.toString() && text.toString().replace(/\[object Object\],/g, '')}
    >
      {text}
    </div>
  );

};

export default InputTextarea;

