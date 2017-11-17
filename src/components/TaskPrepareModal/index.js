import React, { Component, PropTypes } from 'react';
import { Modal, Button, Select } from 'antd';
import { connect } from 'dva';
import { Task } from '../../models/task';
import styles from './styles.less';

const Option = Select.Option;

class TaskPrepareModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    uploading: PropTypes.bool,
    task: PropTypes.instanceOf(Task)
  };
  static defaultProps = {};
  static operateTypes = [
    { label: '放弃导入', value: '4' },
    { label: '覆盖导入', value: '5' }
  ];

  onCancel = () => {

  };

  onOk = () => {

  };

  render() {
    const { visible, uploading, task } = this.props;
    return (
      <Modal
        title={task.getTitle()}
        onCancel={this.onCancel}
        onOk={this.onOk}
      >
        <ul className={styles.steps}>
          <li>
            <div className={styles.title}>
              <span>请按照Excel数据模版格式准备数据</span>
              <Button>下载模板</Button>
            </div>
          </li>
          <li>
            <div className={styles.title}>
              <span>当数据重复时的操作方式</span>
              <Select>
                {TaskPrepareModal.operateTypes.map(t => (
                  <Option key={t.value}>{t.label}</Option>
                ))}
              </Select>
            </div>
          </li>
          <li>
            <div className={styles.title}>
              <span>选择已填写好的Excel文件</span>
              <Button>选择文件</Button>
            </div>
          </li>
        </ul>
        <div className={styles.tips}>
          <p className={styles.tipstitle}>注意事项：</p>
          <p className={styles.tipscontent}>
            1. 模版中的表头名称不可更改，表头行不能删除 <br />
            2.导入文件大小请勿超过 2 MB <br />
            3.红色列表头为必填字段 <br />
            4.其他选填字段，如填写了，数据也要正确，否则导入会失败 <br />
            5.行政区域，输入省、市或者省市区，都可以 <br />
            6.所属行业、客户规模，必须为系统在库的数据，可在“系统管理》业务参数设置”中查看 <br />
            7.日期格式为 YYYY/MM/DD,如 2015/8/8 <br />
            8.字段格式为多选框的，多个值之间用“ ；”隔开
          </p>
        </div>
      </Modal>
    );
  }
}

export default connect(
  state => state.task.modal,
  dispatch => {

  }
)(TaskPrepareModal);
