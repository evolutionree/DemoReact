import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';
import styles from './styles.less';

class RuleSetInput extends Component {
  static propTypes = {
    rules: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onChange = event => {
    this.props.onChange(event.target.value);
  };

  parseValue = () => {
    return this.props.value;
  };

  render() {
    return (
      <div className={styles.ruleset}>
        <Input
          type="textarea"
          value={this.parseValue()}
          onChange={this.onChange}
          placeholder="例如：( $1 AND $2 ) OR $3"
        />
      </div>
    );
  }
}

export default RuleSetInput;
