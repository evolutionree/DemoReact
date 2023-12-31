import React, { Component, PropTypes } from 'react';
import { Cascader } from 'antd';
import { is } from 'immutable';
import connectBasicData from '../../../models/connectBasicData';
import { resolveTreeByPathSearch, matchPath } from '../../../utils';

/**
 * 将行政区域Code转为数组形式
 * 如101122 => ['10', '11' , '22']
 * @param regionId {Number|String}
 * @returns {Array}
 */
function regionIdToArray(regionId) {
  // 110101
  if (!regionId) return [];
  const strRegionId = regionId + '';
  let [foo, pRegion, cRegion, dRegion] = strRegionId.match(/(\d\d)(\d\d)(\d\d)/);
  dRegion = dRegion !== '00' ? (pRegion + cRegion + dRegion) : '';
  cRegion = cRegion !== '00' ? (pRegion + cRegion + '00') : '';
  pRegion = pRegion + '0000';
  const array = dRegion ? [+pRegion, +cRegion, +dRegion]
    : cRegion ? [+pRegion, +cRegion] : [+pRegion];
  return array;
}

class SelectRegion extends Component {
  static propTypes = {
    regionData: PropTypes.array
  };
  static defaultProps = {
    regionData: []
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.setValue = this.ensureDataReady(this.setValue);
    this.setValueByName = this.ensureDataReady(this.setValueByName);
    if (props.regionData.length) {
      this.setDataReady();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.regionData.length && nextProps.regionData.length) {
      setTimeout(this.setDataReady, 0);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
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

  setValue = val => {
    this.props.onChange(val, true);
  };

  setValueByName = valueName => {
    if (!valueName) {
      this.props.onChange('', true);
      return;
    }
    let matched;
    matchPath(this.getOptions(), valueName, 'regionname', node => matched = node);
    if (matched) {
      this.props.onChange(matched.regionid, true);
    }
  };

  onSelectChange = (val, selectedOptions) => {
    if (val && !val.length) {
      this.props.onChange();
    } else {
      const opt = selectedOptions[selectedOptions.length - 1];
      if (opt.selectable === false) return;
      this.props.onChange(val[val.length - 1]);
    }
  };

  getOptions = () => {
    const {
      regionData,
      designateNodes,
      designateFilterNodes
    } = this.props;
    let options = [];
    if (regionData && regionData.length) {
      options = resolveTreeByPathSearch(regionData[0].children, designateNodes, designateFilterNodes);
    }
    return options;
  };

  parseValue = (value, allRegions) => {
    if (!value) return [];
    const stack = [];
    _loopRegions(allRegions);
    return stack;

    function _loopRegions(regions) {
      for (let i = 0, len = regions.length; i < len; i += 1) {
        const { regionid, children } = regions[i];
        stack.push(regionid);

        let matched = false;
        let childrenMatched = false;

        if (regionid === value * 1) {
          matched = true;
        } else if (children && children.length) {
          childrenMatched = _loopRegions(children);
        }

        if (matched || childrenMatched) return true;

        stack.pop();
      }
    }
  };

  render() {
    const { value, isReadOnly, onFocus } = this.props;
    const options = this.getOptions();
    const currentLocale = window.localStorage.getItem('currentLocale') || '';
    const placeholder = currentLocale === 'en' ? 'Pleace select' : currentLocale === 'tw' ? '請選擇' : '请选择';

    return (
      <Cascader
        changeOnSelect
        options={options}
        placeholder={placeholder}
        value={this.parseValue(value, options)}
        onChange={this.onSelectChange}
        disabled={isReadOnly === 1}
        onFocus={onFocus}
        style={{ width: '100%', height: '32px' }}
        showSearch={(inputValue, path) => {
          return path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
        }}
      />
    );
  }
}

export default connectBasicData('regionData', SelectRegion);
