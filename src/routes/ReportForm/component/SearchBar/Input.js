/**
 * Created by 0291 on 2017/8/21.
 */
import React, { Component } from 'react';
import { Input, DatePicker } from 'antd';
import Select from './Select';
import SetSeriesModal from './SetSeriesModal';
import SelectDataSource from '../../../../components/DynamicForm/controls/SelectDataSource';
import SelectProductBigData from '../../../../components/DynamicForm/controls/SelectProductBigData';
import SelectProductSerial from '../../../../components/DynamicForm/controls/SelectProductSerial';
import moment from 'moment';

const { MonthPicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';

class InputComponent extends Component {
  static propTypes = {

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }

  changeHandler(value) {
    this.props.onChange && this.props.onChange(value);
  }

  renderComponent() {
    switch (this.props.type) {
      case 1:
        return <Input value={this.props.value} onChange={(e) => { this.props.onChange(e.target.value) }} />
      case 2:
        return this.props.combodata.datasource.instid ? <Select value={this.props.value} url="/api/ReportEngine/queryData" params={this.props.combodata.datasource} onChange={this.changeHandler.bind(this)} />
          : <Select value={this.props.value} dataSource={this.props.combodata.datalist} onChange={this.changeHandler.bind(this)} />;
      case 4:
        return <DatePicker value={this.props.value ? moment(this.props.value, dateFormat) : null} style={{ width: '120px' }} onChange={(date) => { this.props.onChange(date && date.format(dateFormat)) }} format={dateFormat} />;
      case 5:
        return <SetSeriesModal settingData={this.props.value} onChange={(date) => { this.props.onChange(date)}} />;
      case 6:
        return <SelectDataSource style={{ width: '120px' }} value={this.props.value} {...this.props.multichoosedatasource} dataSource={{
          type: this.props.multichoosedatasource.datasource.type,
          sourceId: this.props.multichoosedatasource.datasource.sourceid
        }} onChange={(value) => { this.props.onChange(value) }} />
      case 7:
        return <div style={{ width: '200px' }}><SelectProductBigData value={this.props.value} onChange={value => this.props.onChange(value) } {...this.props.multichoosedatasource} /></div>;
      case 8:
        return <div style={{ width: '200px' }}><SelectProductSerial value={this.props.value} onChange={value => this.props.onChange(value) } {...this.props.multichoosedatasource} /></div>;
      case 9:
        return <MonthPicker value={this.props.value ? moment(this.props.value, monthFormat) : null} style={{ width: '120px' }} onChange={(date) => { this.props.onChange(date && date.format(monthFormat)) }} format={monthFormat} />;
      default:
        return <div>searchBar未识别</div>;
    }
  }

  render() {
    return this.renderComponent();
  }
}

export default InputComponent;
