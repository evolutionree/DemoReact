/**
 * Created by 0291 on 2018/8/24.
 * TODO: 表格批量新增Modal
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Form } from 'antd';
import DynamicField from '../DynamicForm/DynamicField';

const FormItem = Form.Item;

const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

class RelTableBatchModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    protocl: PropTypes.object
  };

  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      valueObj: null
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.setState({ valueObj: null });
      if (this.props.protocl) this.props.form.resetFields();
    }
  }

  onCancel = () => {
    this.props.onCancel();
  };

  onConfirm = () => {
    const valueObj = this.state.valueObj;
    const field = this.props.protocl;
    const valueNameArray = valueObj && valueObj.value_name && valueObj.value_name.split(',');
    const data = valueObj && valueObj.value && valueObj.value.split(',').map((item, index) => {
      if (field.controltype === 18) { //数据源控件 值需要设定为{ id: '', name: '' }的格式
        return {
          value: { id: item, name: valueNameArray[index] },
          value_name: valueNameArray[index]
        };
      } else {
        return {
          value: item,
          value_name: valueNameArray[index]
        };
      }
    });
    // onConfirm后面的逻辑里面有同步ajax请求，会阻塞UI线程，无法做loading效果。让用户体验吃屎去吧
    this.props.onConfirm && this.props.onConfirm(data);
  };

  onChangeWithName = (valueObj) => {
    this.setState({
      valueObj: valueObj
    });
  }

  render() {
    const { form, protocl } = this.props;
    if (protocl && form) {
      const { getFieldDecorator } = form;
      let { fieldconfig, fieldid, fieldname, displayname, controltype } = protocl;
      if (controltype === 3) { //表格批量新增的是字典控件的数据时  弹出窗是才有多选 下拉让 用户添加
        controltype = 4;
      }
      return (
        <Modal title="批量新增"
          width={589}
          visible={this.props.visible}
          onCancel={this.onCancel}
          onOk={this.onConfirm} 
        >
          <FormItem
            {...formItemLayout}
            label={displayname}
          >
            {getFieldDecorator(fieldname)(
              <DynamicField
                isCommonForm
                controlType={controltype}
                fieldId={fieldid}
                onChangeWithName={this.onChangeWithName}
                config={{
                  ...fieldconfig,
                  multiple: 1
                }}
                fieldLabel={displayname}
              />
            )}
          </FormItem>
        </Modal>
      );
    } else {
      return null;
    }
  }
}

export default connect()(Form.create()(RelTableBatchModal));
