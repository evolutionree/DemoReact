import React from 'react';
import { Select } from 'antd';
import connectBasicData from '../models/connectBasicData';
import { getIntlText } from './UKComponent/Form/IntlText';

const Option = Select.Option;

class DicTypeSelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    width: React.PropTypes.string,
    multiple: React.PropTypes.bool,
    showSearch: React.PropTypes.bool
  };
  static defaultProps = {
    dictionaryData: {},
    showSearch: false
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (value) => {
    const { onChange } = this.props;
    if (onChange) onChange(value);
  };

  render() {
    const { width = '100%', value, showSearch, dictionaryData, placeholder = '请选择部门级别', ...rest } = this.props;

    return dictionaryData ? (
      <Select
        allowClear
        showSearch={showSearch || true}
        style={{ width }}
        placeholder={placeholder}
        value={value}
        onChange={this.handleChange}
        {...rest}
      >
        <Option disabled value="0">未选择</Option>
        {
          Object.keys(dictionaryData).length ? Array.isArray(dictionaryData[154]) &&
            dictionaryData[154].map(item => {
              return (
                <Option key={item.dataid} value={item.dataid + ''}>{getIntlText('dataval', item)}</Option>
              );
            }) : null
        }
      </Select>
    ) : <div style={{ display: 'inline-block' }}>loading...</div>;
  }
}

export default connectBasicData('dictionaryData', DicTypeSelect);
