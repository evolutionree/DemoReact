/**
 * Created by 0291 on 2017/12/27.
 */
import React, { Component } from 'react';
import { Modal } from 'antd';
import ScheduleForm from './ScheduleForm';
import TaskForm from './TaskForm';
import classnames from 'classnames';
import Styles from './index.less';

class FormModal extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      titleNodeData: [{ name: '日程', active: true }, { name: '任务', active: false }]
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {

  }

  changeTitleNodeActive(name) {
    const newTitleNodeData = this.state.titleNodeData.map((item) => {
      if (item.name === name) {
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
    this.setState({
      titleNodeData: newTitleNodeData
    });
  }

  render() {
    const titleNodeData = this.state.titleNodeData;
    const titleNode = titleNodeData.map((item, index) => {
      const cls = classnames({ [Styles.active]: item.active })
      return <span key={index} onClick={this.changeTitleNodeActive.bind(this, item.name)} className={cls}>{item.name}</span>;
    })
    return (
      <Modal visible={true} title={<div className={Styles.header}>{titleNode}</div>} wrapClassName="formModalWrap">
        {
          titleNodeData[0].active ? <ScheduleForm /> : null
        }
        {
          titleNodeData[1].active ? <TaskForm /> : null
        }
      </Modal>
    );
  }
}


export default FormModal;
