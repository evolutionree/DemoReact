/**
 * Created by 0291 on 2018/4/17.
 */
import React, { PropTypes, Component } from 'react';
import { Icon, Dropdown, Menu, Input, Button, DatePicker, Checkbox } from 'antd';
import SelectList from './SelectList';
import RangeNumber from './RangeNumber';
import { getIntlText } from '../../UKComponent/Form/IntlText';
import moment from 'moment';
import Styles from './index.less';

const { RangePicker } = DatePicker;

const filterShowComponent = { //不同类型的字段 搜索面板不一样
  date: [8, 9, 1004, 1005, 1011],
  multiple: [3],
  number: [6, 7]
};

class FilterDrop extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    onFilter: PropTypes.func.isRequired,
    hideFilter: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      value: this.getTransformDateValue(this.props.value), //传给接口查询全部是字符串， 需转换为前端UI控件 对应的数据类型（格式）
      checked: this.props.value === 'isnull' ? 'isnull' : false
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.hideFilterDrop.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.hideFilterDrop);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      this.setState({
        value: this.getTransformDateValue(nextProps.value),
        checked: nextProps.value === 'isnull' ? 'isnull' : false
      });
    }
  }

  getTransformDateValue(toTransformValue) {
    if (typeof toTransformValue === 'string' && toTransformValue !== '' && toTransformValue !== 'isnull') {
      const field = this.props.field;
      let newValue = toTransformValue;
      if (filterShowComponent.date.indexOf(field.controltype) > -1) {
        newValue = newValue.split(',');
        const dateFormat = 'YYYY-MM-DD';
        newValue[0] = moment(newValue[0], dateFormat);
        newValue[1] = moment(newValue[1], dateFormat);
      } else if (filterShowComponent.multiple.indexOf(field.controltype) > -1 || filterShowComponent.number.indexOf(field.controltype) > -1) {
        newValue = newValue.split(',').map(item => {
          let newItem = item;
          if (newItem !== 'isnull') {
            newItem = Number(item);
          }
          return newItem;
        });
      }
      return newValue;
    } else {
      return null;
    }
  }

  hideFilterDrop(e) {
    const parentDom = document.getElementsByClassName('ant-calendar-panel')[0];
    setTimeout(() => {
      if (parentDom) {
       // this.props.hideFilter && this.props.hideFilter(this.props.field.fieldname, true);
      } else {
        this.props.hideFilter && this.props.hideFilter(this.props.field.fieldname, false);
      }
    }, 30);
  }

  onCheckChange = (e) => {
    this.setState({
      value: null,
      checked: e.target.checked ? 'isnull' : false
    });
  }

  onSelectChange = (checkedValues) => {
    this.setState({
      value: checkedValues
    });
  }

  onInputChange = (e) => {
    this.setState({
      value: e.target.value,
      checked: false
    });
  }

  onDateChange = (date, dateString) => {
    this.setState({
      value: date,
      checked: false
    });
  }

  onRangeChange = (rangeValue) => {
    this.setState({
      value: rangeValue,
      checked: false
    });
  }

  onSearch = () => {
    this.queryData(this.state.value, this.state.checked);
  }

  clearFilter = () => {
    const field = this.props.field;
    this.props.onFilter && this.props.onFilter(field.fieldname, '');
  }

  queryData(value, cheked) {
    let submitValue = value;
    const field = this.props.field;
    const dateFormat = 'YYYY-MM-DD';
    if (cheked) {
      submitValue = cheked;
    } else {
      if (filterShowComponent.date.indexOf(field.controltype) > -1) {
        submitValue = [this.state.value[0].format(dateFormat) + ' 00:00:00', this.state.value[1].format(dateFormat) + ' 23:59:59'].join(',');
      } else if (filterShowComponent.multiple.indexOf(field.controltype) > -1 || filterShowComponent.number.indexOf(field.controltype) > -1) {
        submitValue = submitValue.join(',');
      }
    }
    this.props.onFilter && this.props.onFilter(field.fieldname, submitValue);
  }


  renderHtml() {
    const field = this.props.field;
    if (filterShowComponent.date.indexOf(field.controltype) > -1) { //日期查询
      const dateFormat = 'YYYY-MM-DD';
      return <RangePicker getCalendarContainer={ele => this.filterBody} allowClear={false} onChange={this.onDateChange} value={this.state.value ? this.state.value : null} format={dateFormat} style={{ width: 240 }} />;
    } else if (filterShowComponent.multiple.indexOf(field.controltype) > -1) { //字典
      return <SelectList onChange={this.onSelectChange} dataSource={field.fieldconfig.dataSource} value={this.state.value || []} />;
    } else if (filterShowComponent.number.indexOf(field.controltype) > -1) { //数字筛选
      return <RangeNumber onChange={this.onRangeChange} value={this.state.value || []} />;
    } else {
      return (
        <Input
          ref={ele => this.searchInput = ele}
          placeholder="输入关键字"
          value={this.state.value}
          onChange={this.onInputChange}
          onPressEnter={this.onSearch}
        />
      );
    }
  }

  render() {
    const field = this.props.field;
    return (
      <div className={Styles.Wrap} onClick={e => e.nativeEvent.stopImmediatePropagation()}>
        <div className={Styles.header}>
          <span><Icon type="filter" /><label>筛选-{getIntlText('displayname', field)}</label></span>
          {
            this.props.value ? <span onClick={this.clearFilter}>清除筛选</span> : null
          }
        </div>
        <div className={Styles.body} ref={ref => this.filterBody = ref}>
          {
            this.renderHtml()
          }
          <div>
            {
              filterShowComponent.multiple.indexOf(field.controltype) > -1 ? null : <Checkbox onChange={this.onCheckChange} checked={this.state.checked === 'isnull'}>空(未填写)</Checkbox>
            }
          </div>
        </div>
        <div className={Styles.footer}>
          <Button type="primary" onClick={this.onSearch}>确定</Button>
        </div>
      </div>
    );
  }
}

export default FilterDrop;
