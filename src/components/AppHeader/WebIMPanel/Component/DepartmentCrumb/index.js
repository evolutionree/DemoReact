/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import connectBasicData from '../../../../../models/connectBasicData';
import _ from 'lodash';
import styles from './index.less';


class DepartmentCrumb extends Component {
  static propTypes = {
    childrenDept: PropTypes.array
  };
  static defaultProps = {
    childrenDept: []
  };
  constructor(props) {
    super(props);
    this.state = {
      crumb: []
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  selectDept = (item) => {
    this.setState({
      crumb: [...this.state.crumb, item]
    });
    this.props.onSelect && this.props.onSelect(item.deptid);
  }

  onChangeCrumb = (item) => {
    const { crumb } = this.state;
    const currentIndex = _.findIndex(crumb, crumbItem => crumbItem.deptid = item.deptid);
    const newCrumb = crumb.filter((item, index) => {
      return index <= currentIndex;
    });
    this.setState({
      crumb: newCrumb
    })
    this.props.onSelect && this.props.onSelect(item.deptid);
  }

  selectRootCrumb = (item) => {
    this.setState({
      crumb: []
    });
    this.props.onSelect && this.props.onSelect(item.deptid);
  }

  render() {
    const { departments, childrenDept } = this.props;
    const rootDept = departments[0];
    return (
      <div className={styles.departmentCrumbWrap}>
        <ul className={styles.crumbWrap}>
          <li>
            <span onClick={this.selectRootCrumb.bind(this, rootDept)}>{rootDept && rootDept.deptname}</span>
            <span>{ `>` }</span>
          </li>
          {
            this.state.crumb.map(item => {
              return (
                <li key={item.deptid}>
                  <span onClick={this.onChangeCrumb.bind(this, item)}>{item.deptname}</span>
                  <span>{ `>` }</span>
                </li>
              );
            })
          }
        </ul>
        <ul className={styles.deptWrap}>
          {
            childrenDept instanceof Array && childrenDept.map(item => {
              return <li key={item.deptid} onClick={this.selectDept.bind(this, item)}>{item.deptname}</li>;
            })
          }
        </ul>
      </div>
    );
  }
}

export default connectBasicData('departments', DepartmentCrumb);
