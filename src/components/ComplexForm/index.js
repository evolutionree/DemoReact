/**
 * Created by 0291 on 2017/11/2.
 */
import React from 'react';
import { Form } from 'antd';
import DataModalSelect from './DataModalSelect';

const FormItem = Form.Item;

class ComplexForm extends React.Component {
  static propTypes = {
    form: React.PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }


  renderComponent(componentType) {
    const placeholder = {
      UserSelect: '请选择接收团队',
      DeptSelect: '请选择接收人员'
    };

    if (componentType === 'UserSelect' || componentType === 'DeptSelect') {
      return <DataModalSelect type={componentType} placeholder={placeholder[componentType]} />;
    } else {
      return <div>未识别到组件</div>;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form>
        {
          this.props.model && this.props.model instanceof Array && this.props.model.map((item, index) => {
            return (
              <FormItem label={item.label} key={index}>
                {getFieldDecorator(item.name, {
                  initialValue: item.initialValue
                })(
                  this.renderComponent(item.childrenType)
                )}
              </FormItem>
            );
          })
        }
      </Form>
    );
  }
}

export default Form.create()(ComplexForm);
