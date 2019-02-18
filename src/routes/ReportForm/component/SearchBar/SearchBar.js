/**
 * Created by 0291 on 2017/6/28.
 */
import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Form, Row, Col, Icon, Button, message } from 'antd';
const FormItem = Form.Item;
import Input from './Input';
import ModalSelect from './ModalSelect';

class SearchBarWrap extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      expand: false
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        message.warning('所有搜索项必填')
        return;
      }
      this.props.onSearch && this.props.onSearch(fieldsValue);
    });
  }


  getModalType(item) {
    let modalType = '';
    if (item.multichoosedata.relatectrlindex === 0) { //判断组件ModalSelect是单独存在还是与下列列表组件组合存在 relatectrlindex=0 表示单独存在
      modalType = item.multichoosedata.choosetype.toString();
    } else {
      modalType = this.props.value[this.props.model[item.multichoosedata.relatectrlindex - 1].parametername] ? this.props.value[this.props.model[item.multichoosedata.relatectrlindex - 1].parametername] : null
    }
    return modalType;
  }

  getFields() {
    const { getFieldDecorator } = this.props.form;
    const children = [];
    this.props.model.filter(searchItem => searchItem.multichoosedata.isvisible).map((item, index) => {
      let multiple = 0;
      if (item.ctrltype === 3) {  // ctrltype === 3 表示用户/团队 选择项
        if (item.multichoosedata.relatectrlindex === 0) { //不关联其他组件
          multiple = item.multichoosedata.ismultiselect ? 1 : 0;
        } else {
          const dataList = this.props.model[item.multichoosedata.relatectrlindex - 1].combodata.datalist;
          for (let i = 0; i < dataList.length; i++) {
            if (this.getModalType(item) == dataList[i].dkey) {
              multiple = dataList[i].multiselect === 'true' ? 1 : 0;
              break;
            }
          }
        }
      }
      children.push(
        <FormItem key={index} layout="inline" label={item.labeltext}>
          {getFieldDecorator(item.parametername, {
            initialValue: '',
            trigger: 'onChange',
            validateTrigger: 'onChange',
            rules: [
              //{ required: item.ctrltype === 5 ? false : true, message: ' ' }
            ]
          })(
            // ctrltype === 3 表示用户/团队 选择项
            item.ctrltype === 3 ? <ModalSelect
              multiple={multiple}
              value_name={this.props.value[item.parametername + '_name']}
              modalType={this.getModalType(item)} /> : <Input type={item.ctrltype} {...item} />
          )}
        </FormItem>
      );
    })
    return children;
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        {this.getFields()}
        <FormItem>
          <Button type="primary" htmlType="submit">搜索</Button>
        </FormItem>
      </Form>
    );
  }
}

const SearchBar = Form.create({
  mapPropsToFields({ value }) {
    return _.mapValues(value, val => ({ value: val }));
  },
  onValuesChange({ value, onChange }, values) {
    onChange({
      ...value,
      ...values
    });
  }
})(SearchBarWrap);

export default SearchBar;
