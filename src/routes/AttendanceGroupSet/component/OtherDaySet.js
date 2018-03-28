/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, Form, Select, Icon, DatePicker, message } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import _ from 'lodash';
import Styles from './OtherDaySet.less';

const confirm = Modal.confirm;
const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

class OtherDaySet extends Component {
  static propTypes = {

  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      visible: '',
      editIndex: ''
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let newValue = values;
        newValue.date = moment(values.date).format('YYYY-MM-DD');
        if (this.state.visible === 'add') { //新增
          this.props.onChange && this.props.onChange([...this.props.value, newValue]);
        } else {
          let newValue = [...this.props.value];

          let editObj = values;
          editObj.date = moment(values.date).format('YYYY-MM-DD');

          newValue[this.state.editIndex] = editObj;
          this.props.onChange && this.props.onChange(newValue);
        }
        this.setState({
          visible: ''
        });
      }
    });
  }

  cancel = () => {
    this.setState({
      visible: ''
    });
  }

  add = () => {
    this.props.form.resetFields();
    this.setState({
      visible: 'add'
    });
  }

  edit = (index) => {
    const editData = this.props.value[index];
    this.props.form.setFieldsValue({
      date: moment(editData.date, 'YYYY-MM-DD'),
      class: editData.class
    });

    this.setState({
      visible: 'edit',
      editIndex: index
    });
  }

  del = (index) => {
    confirm({
      title: '确定删除该数据吗?',
      content: '',
      onOk: () => {
        const newValue = this.props.value.filter((item, i) => {
          return index !== i;
        });
        this.props.onChange && this.props.onChange(newValue);
      },
      onCancel() {

      }
    });
  }

  getClassName = (value) => {
    const selectDataSource = this.props.classDataSource;
    const showObj = _.find(selectDataSource, item => item.id === value);
    return showObj.name;
  }


  render() {
    const dataSource = this.props.value;
    const { getFieldDecorator } = this.props.form;

    const selectDataSource = this.props.classDataSource;
    return (
      <div className={Styles.Wrap}>
        <div className={Styles.header}>
          <span>添加必须打卡的日期</span>
          <Icon type="plus" onClick={this.add} />
        </div>
        <ul className={Styles.clearfix}>
          {
            dataSource && dataSource instanceof Array && dataSource.map((item, index) => {
              return (
                <li key={index}>
                  <span>{item.date}</span>
                  <span style={{ paddingLeft: '10px' }}>{this.getClassName(item.class)}</span>
                  <span className={Styles.operateWrap}>
                    <Icon type="edit" onClick={this.edit.bind(this, index)} />
                    <Icon type="delete" onClick={this.del.bind(this, index)} />
                  </span>
                </li>
              );
            })
          }
        </ul>
        <Modal
          title={this.state.visible === 'add' ? '添加特殊日期' : '修改特殊日期'}
          visible={/add|edit/.test(this.state.visible)}
          onOk={this.handleOk}
          onCancel={this.cancel}
          style={{ top: 240 }}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="选择日期"
            >
              {getFieldDecorator('date', {
                initialValue: '',
                rules: [{ required: true, message: '请选择日期' }]
              })(
                <DatePicker />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="选择班次"
            >
              {getFieldDecorator('class', {
                initialValue: '',
                rules: [{ required: true, message: '请选择班次' }]
              })(
                <Select>
                  {
                    selectDataSource.map((item, index) => {
                      return <Option key={index} value={item.id}>{item.worktime ? `${item.name}(${item.worktime})` : `${item.name}`}</Option>;
                    })
                  }
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

const OtherDaySetForm = Form.create()(OtherDaySet);

export default connect(
  state => {
    const { classDataSource } = state.attendanceGroupSet;
    return {
      classDataSource: classDataSource
    };
  }
)(OtherDaySetForm);
