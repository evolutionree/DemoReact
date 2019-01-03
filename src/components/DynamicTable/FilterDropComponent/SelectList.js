/**
 * Created by 0291 on 2018/4/18.
 */
import React, { PropTypes, Component } from 'react';
import { Checkbox } from 'antd';
import connectBasicData from '../../../models/connectBasicData';
import { getIntlText } from '../../UKComponent/Form/IntlText';
import { queryTypes } from '../../../services/entity';
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
    }),
    entityId: PropTypes.string,
    type: PropTypes.number,
    width: PropTypes.number
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
    if (props.type === 1009) { //实体类型控件
      queryTypes({ entityId: props.entityId }).then(result => {
        const entityTypes = result.data.entitytypepros;
        const options = entityTypes.map(item => ({
          value: item.categoryid,
          label: item.categoryname
        }));
        this.setState({ options: [...options, { value: 'isnull', label: '空(未填写)' }] });
      });
    } else {
      const { dataSource: { sourceId }, dictionaryData } = props;
      if (dictionaryData[sourceId]) {
        const options = dictionaryData[sourceId].map(dic => {
          const title = getIntlText('dataval', dic);
          return {
            value: dic.dataid,
            label: <span title={title && title.length > 5 ? title : ''}>{title}</span>
          };
        });
        this.setState({ options: [...options, { value: 'isnull', label: '空(未填写)' }] });
      }
    }
  };


  onChange = checkedValues => {
    this.props.onChange && this.props.onChange(checkedValues);
  };

  render() {
    const { width = 160 } = this.props;
    const { options } = this.state;
    const classWrap = options.length >= 10 ? Styles.MulSelectListWrap : (width === 160 ? Styles.SelectListWrap : Styles.Wrap);

    return (
      <div style={{ width: options.length < 10 ? width : (width === 160 ? width : undefined), marginRight: 8 }} className={classWrap}>
        <CheckboxGroup options={this.state.options} value={this.props.value} onChange={this.onChange} />
      </div>
    );
  }
}

export default connectBasicData('dictionaryData', SelectList);
