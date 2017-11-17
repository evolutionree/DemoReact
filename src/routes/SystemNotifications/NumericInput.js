import { Input } from 'antd';

function formatNumber(value) {
    value += '';
    const list = value.split('.');
    const prefix = list[0].charAt(0) === '-' ? '-' : '';
    let num = prefix ? list[0].slice(1) : list[0];
    let result = '';
    while (num.length > 3) {
      result = `,${num.slice(-3)}${result}`;
      num = num.slice(0, num.length - 3);
    }
    if (num) {
      result = num + result;
    }
    return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
}

class NumericInput extends React.Component {
    onChange = (e) => {
      const { value } = e.target;
      const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
      if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
        this.props.onChange(value);
      }
    }

    onBlur = () => {
      const { value, onBlur, onChange } = this.props;
/*      if (value.charAt(value.length - 1) === '.' || value === '-') {
        onChange({ value: value.slice(0, -1) });
      }
      if (onBlur) {
        onBlur();
      }*/
      if (value === '') {
        this.props.onChange(0);
      }
    }

    render() {
      const { value } = this.props;
      const title = value ? (
        <span className="numeric-input-title">
          {value !== '-' ? formatNumber(value) : '-'}
        </span>
      ) : '';
      return (
          <Input
            {...this.props}
            onChange={this.onChange}
            onBlur={this.onBlur}
            placeholder=""
            maxLength="25"
            defaultValue="0"
          />
      );
    }
}

export default NumericInput;