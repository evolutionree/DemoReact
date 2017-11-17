import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';
import classnames from 'classnames';
import PowerTextArea from '../../PowerTextArea';
import { checkIsDev } from '../../../utils';

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
    const { value, isReadOnly, maxLength, isTable } = this.props;
    return (
      <div className={classnames({ 'input-table-view': isTable })}>
        <TextAreaComponent
          value={this.state.innerVal}
          onChange={this.onInputChange}
          onBlur={this.onInputBlur}
          disabled={isReadOnly === 1}
          maxLength={maxLength}
          autosize={isTable ? { minRows: 2, maxRows: 5 } : { minRows: 7, maxRows: 20 }}
        />
      </div>
    );
  }
}

InputTextarea.View = ({ value, value_name }) => {
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
  return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.5 }}>{text}</div>;
};

export default InputTextarea;

