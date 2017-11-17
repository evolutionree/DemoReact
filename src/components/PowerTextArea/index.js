import React, { PropTypes, Component } from 'react';
import { Input } from 'antd';
import { connect } from 'dva';
import styles from './PowerTextArea.less';

class PowerTextArea extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    editJson: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleEditJson = () => {
    this.props.editJson(this.props.value, newValue => {
      this.props.onChange({ target: { value: newValue } });
      this.props.onBlur({ target: { value: newValue } });
    });
  };

  render() {
    const { editJson, ...rest } = this.props;
    return (
      <div className={styles.wrap}>
        <Input.TextArea {...rest} />
        <div className={styles.btns}>
          <a href="javascript:;" onClick={this.handleEditJson}>编辑json</a>
        </div>
      </div>
    );
  }
}

export default connect(
  () => ({}),
  dispatch => {
    return {
      editJson(json, callback) {
        dispatch({ type: 'powerEdit/editJson', payload: { content: json, callback } });
      }
    };
  }
)(PowerTextArea);
