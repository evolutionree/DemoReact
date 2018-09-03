import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import { Select, Tooltip, Icon } from 'antd';
import _ from 'lodash';
import connectBasicData from '../../../models/connectBasicData';
import { queryYearWeekData } from '../../../services/basicdata';
import IntlText from '../../UKComponent/Form/IntlText';
import { blurByHelper } from './helpers';

const Option = Select.Option;

class SelectSingle extends Component {
  static propTypes = {
    dictionaryData: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    isReadOnly: PropTypes.oneOf([0, 1]),
    dataSource: PropTypes.shape({
      sourceId: PropTypes.string, // 选项的来源字典表id
      sourceKey: PropTypes.string, // 留待扩展使用
      type: PropTypes.string // 留待扩展使用
    }).isRequired,
    designateDataSource: PropTypes.string,
    designateDataSourceByName: PropTypes.string,
    designateFilterDataSource: PropTypes.string,
    designateFilterDataSourceByName: PropTypes.string
  };
  static defaultProps = {
    value: '',
    onFocus: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
  }

  componentDidMount() {
    this.fetchOptions(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.dataSource !== this.props.dataSource)
      || (this.props.dictionaryData !== nextProps.dictionaryData)) {
      this.fetchOptions(nextProps);
    }
    // if (nextProps.value !== this.props.value) {
    //   // const dom = ReactDom.findDOMNode(this.innerRef);
    //   // debugger;
    //   setTimeout(blurByHelper, 10);
    // }
  }

  getTimeStamp(timeStr) {
    const timeStamp = Date.parse(new Date(timeStr));
    return timeStamp / 1000;
  }

  fetchOptions = props => {
    const { dataSource: { sourceId, sourceKey }, dictionaryData } = props;
    if (sourceKey === 'weekinfo') {
      queryYearWeekData().then(weeks => {
        const options = [...weeks];
        let arrayIndex;
        if (options && options instanceof Array) {
          for (let i = 0; i < options.length; i++) {
            if (this.getTimeStamp(new Date()) <= this.getTimeStamp(options[i].weekEnd.replace(/-/g, '/'))) {
              arrayIndex = i;
              break;
            }
          }
        }

        let newOption = [];
        for (let i = arrayIndex - 2; i <= arrayIndex + 2; i++) { //当前周 前后两周
          if (options[i]) {
            newOption.push(options[i]);
          }
        }

        this.setState({ options: newOption }, this.setDataReady);
      });
      return;
    }
    if (dictionaryData[sourceId]) {
      const options = dictionaryData[sourceId].map(dic => ({
        value: dic.dataid,
        label: dic.dataval,
        label_lang: dic.dataval_lang,
        disabled: dic.recstatus === 0
      }));
      this.setState({ options }, this.setDataReady);
    }
  };

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

  setValue = val => {
    if (val === '' || val === undefined || val === null) {
      this.props.onChange('', true);
      return;
    }
    const options = this.getOptions();
    const isValid = options.some(item => (item.value + '') === (val + ''));
    isValid && this.props.onChange(val, true);
  };

  setValueByName = (valueName) => {
    if (!valueName) {
      this.props.onChange('', true);
      return;
    }
    const option = _.find(this.state.options, ['label', valueName]);
    if (option) {
      this.props.onChange(option.value, true);
    }
  };

  onChange = val => {
    if (!val) {
      this.props.onChange();
    } else {
      if (this.props.dataSource && this.props.dataSource.sourceKey === 'weekinfo') {
        this.props.onChange(val);
        return;
      }
      this.props.onChange(parseInt(val, 10));
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
    return (
      <div style={{ height: '32px' }}>
        <Select
          showSearch
          value={value === null || value === undefined ? '' : (value + '')}
          disabled={isReadOnly === 1}
          onChange={this.onChange}
          onFocus={onFocus}
          style={{ width: this.props.toolTip ? 'calc(100% - 22px)' : '100%' }}
          ref={ref => this.innerRef = ref}
        >
          <Option value="">- 请选择 -</Option>
          {options.map(opt => (
            <Option key={opt.value + ''} disabled={opt.disabled}><IntlText name="label" value={opt} /></Option>
          ))}
        </Select>
        {
          this.props.toolTip ? <Tooltip placement="bottom" title={this.props.toolTip}>
            <Icon type="info-circle" style={{ color: '#b8c7ce', fontSize: '18px', marginLeft: '4px' }} />
          </Tooltip> : null
        }
      </div>
    );
  }
}

export default connectBasicData('dictionaryData', SelectSingle);
