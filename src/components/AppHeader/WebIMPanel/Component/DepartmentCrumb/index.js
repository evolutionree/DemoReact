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
    showRoot: PropTypes.bool,
    childrenDept: PropTypes.array,
    deepDrillType: PropTypes.string
  };
  static defaultProps = {
    showRoot: false,
    childrenDept: [],
    deepDrillType: 'onClick'
  };
  constructor(props) {
    super(props);
    this.state = {
      crumb: []
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  selectDept = (item, eventType) => {
    if (this.props.deepDrillType === eventType) {
      this.setState({
        crumb: [...this.state.crumb, item]
      });
    }

    if (eventType === 'onClick') {
      this.props.onSelect && this.props.onSelect(item.deptid, item);
    } else {
      this.props.onChange && this.props.onChange(item.deptid, item);
    }
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

    if (this.props.deepDrillType === 'onClick') {
      this.props.onSelect && this.props.onSelect(item.deptid, item);
    } else {
      this.props.onChange && this.props.onChange(item.deptid, item);
    }
  }

  selectRootCrumb = (item) => {
    this.setState({
      crumb: []
    });
    if (this.props.deepDrillType === 'onClick') {
      this.props.onSelect && this.props.onSelect(item.deptid, item);
    } else {
      this.props.onChange && this.props.onChange(item.deptid, item);
    }
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
        <div onClick={this.selectDept.bind(this, rootDept, 'onClick')} className={styles.rootDept} style={{ display: this.props.showRoot ? 'inline-block' : 'none' }}>
          {rootDept && rootDept.deptname}
        </div>
        <ul className={styles.deptWrap}>
          {
            childrenDept instanceof Array && childrenDept.map(item => {
              return <li key={item.deptid} onClick={this.selectDept.bind(this, item, 'onClick')} onDoubleClick={this.selectDept.bind(this, item, 'onDoubleClick')}>{item.deptname}</li>;
            })
          }
        </ul>
      </div>
    );
  }
}

export default connectBasicData('departments', DepartmentCrumb);
