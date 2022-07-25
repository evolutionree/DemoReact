import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { Icon } from 'antd';
import styles from './FoldableGroup.less';

class FoldableGroup extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    isVisible: PropTypes.bool,
    foldable: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.node),
    theme: PropTypes.string,
    isTitleBold: PropTypes.bool
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
    const { title, children, foldable, theme, isVisible,allFields } = this.props;
    const wrapCls = classnames(
      styles.wrap,
      styles[theme],
      foldable ? (isVisible ? styles.foldable : styles.foldableWhile) : styles.static,

      { [styles.folded]: isFolded }
    );

    // 开票信息分组标题加粗   特殊判断
    const tempArr = allFields.filter(item=>{
      if(title===item.displayname&&item.fieldid==="26e55bec-03e4-4e74-a3ef-90cf4144371a"&&item.controltype===20){
          return true
      }
    })
    const isTitleBold = tempArr.length>0;

    return (
      <div className={wrapCls}>
        {
          isVisible &&
          <div className={styles.title}>
            <span className={styles.titleText} title={title} 
            style={isTitleBold?{fontWeight:'bold',fontSize: '16px'}:null}
            >{title}</span>
            {foldable && <Icon
              className={styles.titleControl}
              type={isFolded ? 'plus' : 'minus'}
              onClick={this.handleToggle}
            />}
          </div>
        }

        <div className={isVisible ? styles.content : styles.contentWhile}>
          {children}
        </div>
      </div>
    );
  }
}

export default FoldableGroup;
