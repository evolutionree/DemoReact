/**
 * Created by 0291 on 2017/7/10.
 */
import React from 'react';
import classnames from 'classnames';
import styles from './styles.less';


class TreeNode extends React.Component {
  static propTypes = {
    expandedKeys: React.PropTypes.array,
    onExpand: React.PropTypes.func,
    onControlDetailModal: React.PropTypes.func,
    data: React.PropTypes.array,
    secondNameKey: React.PropTypes.string,
    thirdNameKey: React.PropTypes.string
  };

  static defaultProps = {
    itemKey: 'id',
    nameKey: 'name',
    secondNameKey: 'username',
    thirdNameKey: 'deptname'
  };

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data
    });
  }

  toggleExpand = (e) => {
    const { onExpand } = this.props;
    e.stopPropagation();
    if (onExpand) onExpand(this.props.data);
  }

  childrenExpand = (data) => {
    const { onExpand } = this.props;
    if (onExpand) onExpand(data);
  }

  controlDetailModal = (e) => {
    const { onControlDetailModal } = this.props;
    e.stopPropagation();
    if (onControlDetailModal) onControlDetailModal(this.props.data);
  }

  childControlDetailModal = (data) => {
    const { onControlDetailModal } = this.props;
    if (onControlDetailModal) onControlDetailModal(data);
  }

  render() {
    const nodeControl = [];
    if (this.state.data.children instanceof Array && this.state.data.children.length > 0) {
      this.state.data.children.forEach((item) => {
        nodeControl.push(
          <TreeNode
            {...this.props}
            key={item[this.props.itemKey]}
            data={item}
            custid={this.props.custid}
            onExpand={this.childrenExpand}
            onControlDetailModal={this.childControlDetailModal}
          />);
      });
    }

    const cls = classnames([styles.treeNodeItem, {
      [styles.treeNodeItemActive]: this.state.data[this.props.itemKey] === this.props.custid,  //当前客户
      [styles.hasChildren]: !!nodeControl.length,
      [styles.childrenHidden]: this.props.expandedKeys && this.props.expandedKeys.indexOf(this.state.data[this.props.itemKey]) === -1
    }]);

    return (
      <li className={cls} onClick={this.toggleExpand}>
        <div>
          <i />
          {
            this.props.onControlDetailModal && this.state.data.id !== '10000000-0000-0000-0000-000000000000' ? (
              <span style={{ color: '#3398db', cursor: 'pointer' }} onClick={this.controlDetailModal}>{this.state.data[this.props.nameKey]}</span>
            ) : <span>{this.state.data[this.props.nameKey]}</span>
          }
          <span className={styles.remarkInfo}>{this.state.data[this.props.secondNameKey] ? this.state.data[this.props.secondNameKey] : '(无)'}</span>
          <span className={styles.remarkInfo}>{this.state.data[this.props.thirdNameKey] ? this.state.data[this.props.thirdNameKey] : '(无)'}</span>

        </div>
        <ul className={
          classnames({
            [styles.hidden]:
              this.props.expandedKeys &&
              this.props.expandedKeys.indexOf(this.state.data[this.props.itemKey]) === -1
          })
        }>
          {nodeControl}
        </ul>
      </li>
    );
  }
}
export default TreeNode;
