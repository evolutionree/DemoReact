import React, { Component, PropTypes } from 'react';
import { Icon } from 'antd';
import classnames from 'classnames';
import css from './FoldBox.less';

class FoldBox extends Component {
  static propTypes = {
    children: PropTypes.node,
    showToggle: PropTypes.bool,
    style: PropTypes.object
  };
  static defaultProps = {
    children: '暂无内容',
    showToggle: true
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleOpen() {
    if (this.state.open) return;
    this.setState({ open: true });
  }

  handleClose() {
    if (!this.state.open) return;
    this.setState({ open: false });
  }

  render() {
    const { children, showToggle } = this.props;
    const cls = classnames({
      [css.foldBox]: true,
      [css.showToggle]: showToggle,
      [css.open]: this.state.open
    });
    return (
      <div className={cls}
           style={{ ...this.props.style }}
           ref={(el) => { this.wrapper = el; }}
           onMouseLeave={this.handleClose.bind(this)}>

        <div className={css.inner} ref={(el) => { this.inner = el; }}>
          {children || '暂无内容'}
        </div>
        <Icon type="down" className={css.toggle}
              onMouseEnter={this.handleOpen.bind(this)} />
      </div>
    );
  }
}

export default FoldBox;
