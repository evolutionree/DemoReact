/**
 * Created by 0291 on 2018/4/18.
 */
import React, { PropTypes, Component } from 'react';
import { Checkbox } from 'antd';
import connectBasicData from '../../../models/connectBasicData';
import Styles from './SelectList.less';

const CheckboxGroup = Checkbox.Group;

class SelectList extends Component {
  static propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    dataSource: PropTypes.shape({
      sourceId: PropTypes.string, // 选项的来源字典表id
      sourceKey: PropTypes.string, // 留待扩展使用
      type: PropTypes.string // 留待扩展使用
    }).isRequired
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
  }

  componentDidMount() {
    this.fetchOptions(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.dataSource !== this.props.dataSource)
      || (this.props.dictionaryData !== nextProps.dictionaryData)) {
      this.fetchOptions(nextProps);
    }
  }

  fetchOptions = props => {
    const { dataSource: { sourceId }, dictionaryData } = props;
    if (dictionaryData[sourceId]) {
      const options = dictionaryData[sourceId].map(dic => ({
        value: dic.dataid,
        label: dic.dataval
      }));
      this.setState({ options: [
        ...options,
        {
          value: 'isnull',
          label: '空(未填写)'
        }
      ] });
    }
  };


  onChange = checkedValues => {
    this.props.onChange && this.props.onChange(checkedValues);
  };

  render() {
    return (
      <div className={Styles.SelectListWrap}>
        <CheckboxGroup options={this.state.options} value={this.props.value} onChange={this.onChange} />
      </div>
    );
  }
}

export default connectBasicData('dictionaryData', SelectList);
