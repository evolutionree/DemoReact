/**
 * Created by 0291 on 2018/6/15.
 */
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import styles from './index.less';

class ButtonGroup extends Component {
  static propTypes = {
    model: React.PropTypes.array.isRequired,
    onClick: React.PropTypes.func,
    style: React.PropTypes.object
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  btnClickHandler = (name) => {
    this.props.onClick && this.props.onClick(name);
  }

  render() {
    return (
      <div className={styles.btnGroup} style={{ ...this.props.style }}>
        {
          this.props.model.map(item => {
            return <div key={item.name} onClick={this.btnClickHandler.bind(this, item.name)} className={classnames({ [styles.active]: item.active })}>{item.title}</div>;
          })
        }
      </div>
    );
  }
}

export default ButtonGroup;
