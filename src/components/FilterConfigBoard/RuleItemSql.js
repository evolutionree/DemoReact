import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';
import styles from './styles.less';

class RuleItemSql extends Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleTextareaChange = event => {
    const sql = event.target.value;
    this.props.onChange({ dataVal: sql });
  };

  render() {
    const sql = this.props.value.dataVal || '';
    return (
      <Input
        placeholder="请输入SQL"
        type="textarea"
        value={sql} onChange={this.handleTextareaChange}
      />
    );
  }
}

export default RuleItemSql;

