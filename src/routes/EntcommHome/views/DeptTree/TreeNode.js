/**
 * Created by 0291 on 2017/7/10.
 */
import React from 'react';
import styles from './styles.less';
import classnames from 'classnames';

class TreeNode extends React.Component {
  static propTypes = {

  };

  static defaultProps = {
    itemKey: 'recid',
    nameKey: 'recname',
    secondNameKey: 'deptgroup_name',
    thirdNameKey: 'parentdept_name'
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


  render () {
    let nodeControl = [];
    if (this.state.data.children instanceof Array && this.state.data.children.length > 0)
    {
      this.state.data.children.map((item, index) => {
        nodeControl.push(<TreeNode {...this.props} key={item[this.props.itemKey]} data={item} custid={this.props.custid} />);
      });
    }

    const cls = classnames([styles.treeNodeItem, {
      [styles.treeNodeItemActive]: this.state.data[this.props.itemKey] === this.props.custid  //当前客户
    }]);
    return (
      <li className={cls}>
        <div>
          <i></i>
          <span>{this.state.data[this.props.nameKey]}</span>
        </div>
        <ul>
          {nodeControl}
        </ul>
      </li>
    );
  }
}
export default TreeNode;
