/**
 * Created by 0291 on 2018/4/18.
 */
import React, { PropTypes, Component } from 'react';
import { Radio } from 'antd';
import { getIntlText } from '../../UKComponent/Form/IntlText';
import { queryTypes } from '../../../services/entity';
import Styles from './SelectList.less';

const RadioGroup = Radio.Group;

class SelectList extends Component {
  static propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
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
    if ((nextProps.entityId !== this.props.entityId)) {
      this.fetchOptions(nextProps);
    }
  }

  fetchOptions = props => {
    queryTypes({ entityId: props.entityId }).then(result => {
      const entityTypes = result.data.entitytypepros;
      const options = entityTypes.map(item => ({
        value: item.categoryname,
        label: <span title={item.categoryname && item.categoryname.length > 5 ? item.categoryname : ''}>{item.categoryname}</span>
      }));
      this.setState({ options: options });
    });
  };


  onChange = e => {
    this.props.onChange && this.props.onChange(e.target.value);
  };

  render() {
    const { width = 160 } = this.props;
    const { options } = this.state;
    const classWrap = options.length >= 10 ? Styles.MulSelectListWrap : (width === 160 ? Styles.SelectListWrap : Styles.Wrap);
    return (
      <div style={{ width, marginRight: 8 }} className={classWrap}>
        <RadioGroup options={this.state.options} value={this.props.value} onChange={this.onChange} />
      </div>
    );
  }
}

export default SelectList;
