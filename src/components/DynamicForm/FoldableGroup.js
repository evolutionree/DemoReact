import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import styles from './FoldableGroup.less';

class FoldableGroup extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    foldable: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.node),
    theme: PropTypes.string
  };
  static defaultProps = {
    foldable: false,
    theme: 'default'
  };

  constructor(props) {
    super(props);
    this.state = {
      isFolded: false
    };
  }

  handleToggle = () => {
    this.setState({
      isFolded: !this.state.isFolded
    });
  };

  render() {
    const { isFolded } = this.state;
    const { title, children, foldable, theme } = this.props;
    const wrapCls = classnames(
      styles.wrap,
      styles[theme],
      foldable ? styles.foldable : styles.static,
      { [styles.folded]: isFolded }
    );
    return (
      <div className={wrapCls}>
        <div className={styles.title}>
          <span className={styles.titleText} title={title}>{title}</span>
          {foldable && <Icon
            className={styles.titleControl}
            type={isFolded ? 'plus' : 'minus'}
            onClick={this.handleToggle}
          />}
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    );
  }
}

export default FoldableGroup;
