/**
 * Created by 0291 on 2017/7/10.
 */
import React from 'react';
import styles from './styles.less';
import classnames from 'classnames';

class TreeNode extends  React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:this.props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data
    })
  }


  render () {
    let nodeControl = [];
    if (this.state.data.children instanceof Array && this.state.data.children.length > 0)
    {
      this.state.data.children.map((item, index) => {
        nodeControl.push(<TreeNode key={item.id}  data={item} custid={this.props.custid}/>);
      });
    }

    const cls = classnames([styles.treeNodeItem, {
      [styles.treeNodeItemActive]: this.state.data.id === this.props.custid  //当前客户
    }]);
    return (
      <li className={cls}>
        <div>
          <i></i>
          <span>{this.state.data.name}</span>
          <span className={styles.remarkInfo}>{this.state.data.username ? this.state.data.username : `(无)`}</span>
          <span className={styles.remarkInfo}>{this.state.data.deptname ? this.state.data.deptname : `(无)`}</span>
        </div>
        <ul>
          {nodeControl}
        </ul>
      </li>
    )
  }
};
export default TreeNode;
