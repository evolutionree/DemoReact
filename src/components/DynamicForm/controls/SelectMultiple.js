import React, { PropTypes, Component } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import connectBasicData from '../../../models/connectBasicData';
import { blurByHelper } from './helpers';

const Option = Select.Option;

class SelectMultiple extends Component {
  static propTypes = {
    dictionaryData: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onChangeWithName: PropTypes.func,
    isReadOnly: PropTypes.oneOf([0, 1]),
    dataSource: PropTypes.shape({
      sourceId: PropTypes.string.isRequired, // 选项的来源字典表id
      sourceKey: PropTypes.string, // 留待扩展使用
      type: PropTypes.string // 留待扩展使用
    }).isRequired
  };
  static defaultProps = {
    value: '',
    onFocus: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      options: this.fetchOptions(props)
    };
    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
    if (this.state.options.length) {
      setTimeout(this.setDataReady, 0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.dataSource !== this.props.dataSource)
      || (this.props.dictionaryData !== nextProps.dictionaryData)) {
      this.setState({ options: this.fetchOptions(nextProps) }, this.setDataReady);
    }
    // if (nextProps.value !== this.props.value) {
    //   setTimeout(blurByHelper, 10);
    // }
  }

  setDataReady = () => {
    this._dataReady = true;
    if (this._onDataReady) {
      this._onDataReady.forEach(fn => fn());
      this._onDataReady = [];
    }
  };
  ensureDataReady = callback => {
    return (...args) => {
      if (this._dataReady) return callback(...args);
      if (!this._onDataReady) this._onDataReady = [];
      this._onDataReady.push(callback.bind(this, ...args));
    };
  };

  fetchOptions = (props) => {
    const { dataSource: { sourceId }, dictionaryData } = props;
    if (dictionaryData[sourceId]) {
      return dictionaryData[sourceId].map(dic => ({
        value: dic.dataid,
        label: dic.dataval,
        disabled: dic.recstatus === 0
      }));
    }
    return [];
  };

  setValue = val => {
    if (val === '' || val === undefined || val === null) {
      this.props.onChange('', true);
      return;
    }
    const options = this.getOptions();
    const validateVals = val.split(',').filter(v => {
      return options.some(item => (item.value + '') === (v + ''));
    });
    this.props.onChange(validateVals.join(','), true);
  };

  setValueByName = (valueName) => {
    if (!valueName) {
      this.props.onChange('', true);
      return;
    }
    const arrValue = valueName.split(',').map(item => {
      const option = _.find(this.state.options, ['label', item]);
      return option && option.value;
    }).filter(item => item !== undefined);
    this.onSelectChange(arrValue, true);
  };

  onSelectChange = arrValue => {
    this.props.onChange && this.props.onChange(arrValue.join(','));
    if (this.props.onChangeWithName) {
      const self = this;
      const value_name = arrValue.map(id => {
        return _.find(self.state.options, ['value', +id]).label;
      }).join(',');
      this.props.onChangeWithName({
        value: arrValue.join(','),
        value_name
      });
    }
  };

  filterOption = value => {
    const option = _.find(this.state.options, ['value', value]);
    const {
      designateDataSource,
      designateDataSourceByName,
      designateFilterDataSource,
      designateFilterDataSourceByName
    } = this.props;
    let flag = true;
    let tempArray = [];
    if (designateDataSource) {
      tempArray = designateDataSource.split(',');
      flag = _.includes(tempArray, value + '');
    } else if (designateDataSourceByName) {
      tempArray = designateDataSourceByName.split(',');
      flag = _.includes(tempArray, option.label);
    }
    if (designateFilterDataSource) {
      tempArray = designateFilterDataSource.split(',');
      flag = flag && !_.includes(tempArray, value + '');
    }
    if (designateFilterDataSourceByName) {
      tempArray = designateFilterDataSourceByName.split(',');
      flag = flag && !_.includes(tempArray, option.label);
    }
    return flag;
  };

  getOptions = () => {
    return this.state.options.filter(opt => {
      return this.filterOption(opt.value);
    });
  };

  render() {
    const { value, isReadOnly, onFocus } = this.props;
    const options = this.getOptions();
    const arrValue = value ? value.toString().split(',') : [];
    return (
      <Select
        value={arrValue}
        disabled={isReadOnly === 1}
        onChange={this.onSelectChange}
        onFocus={onFocus}
        optionFilterProp="children"
        mode="multiple"
        style={{ width: '100%' }}
      >
        {options.map(opt => (
          <Option key={opt.value} style={opt.disabled ? { display: 'none'} : null}>{opt.label}</Option>
        ))}
      </Select>
    );
  }
}

export default connectBasicData('dictionaryData', SelectMultiple);
