import React, { PropTypes } from 'react';
import { Form, Row, Col } from 'antd';
import createJSEngineProxy from './createJSEngineProxy';
import FoldableGroup from './FoldableGroup';
import DynamicFieldView from './DynamicFieldView';
import IntlText from '../UKComponent/Form/IntlText';
import styles from './styles.less';

const FormItem = Form.Item;
const onlylineField = [2, 5, 15, 22, 23, 24];
const formItemWrap_hasNoBackground_field = [2, 15, 20, 21, 22, 23, 24];

class DynamicFormView extends React.Component {
  static propTypes = {
    entityTypeId: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({
      fieldname: PropTypes.string.isRequired,
      displayname: PropTypes.string.isRequired,
      controltype: PropTypes.number.isRequired,
      fieldconfig: PropTypes.object.isRequired
    })),
    value: PropTypes.object.isRequired,
    horizontal: PropTypes.bool,
    cols: PropTypes.number //单个表单项所占栅格宽 没有传 则默认走系统计算（超1400宽的客户端三列， 否则两列展示）
  };

  static defaultProps = {
    horizontal: false
  };

  getFormLayout = () => {
    if (this.props.horizontal) return 'horizontal';
    const { fields } = this.props;
    let layout = 'vertical';
    if (fields && fields[0]) {
      const { fieldconfig } = fields[0];
      if (fieldconfig && fieldconfig.style === 0) {
        layout = 'horizontal';
      }
    }
    return layout;
  };

  getFormItemLayout = () => {
    return this.getFormLayout() === 'horizontal'
      ? { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
      : null;
  };

  renderFields = fields => {
    const { value, entityId, entityTypeId, cols } = this.props;
    return fields.filter(field => field.controltype !== 30).map(field => {
      const { fieldname, displayname, controltype, fieldconfig } = field;
      const layout = this.getFormItemLayout(field.fieldname);

      let colNum = 24;
      if (onlylineField.indexOf(field.controltype) > -1 || (field.controltype === 25 && field.fieldconfig.multiple === 1)) {
        colNum = 24;
      } else if (cols) {
        colNum = cols;
      } else {
        if (document.body.clientWidth > 1500) {
          colNum = 6;
        } else if (document.body.clientWidth > 1100) {
          colNum = 8;
        } else {
          colNum = 12;
        }
      }

      //TODO: 表单查看 项 用样式区分label和值项
      let className = formItemWrap_hasNoBackground_field.indexOf(field.controltype) > -1 ? '' : 'hasBackground';
      //this.props.cols 暂时数据源 也是用本组件  然后每单元项一列显示
      if (this.getFormLayout() === 'horizontal' && !cols) { //TODO： 如果表单单元项 lable 和 formItem是横向布局， 有的单元项会占一行，导致lable的宽跟其他表单项对不齐  so...
        if (document.body.clientWidth > 1500) {
          className = colNum === 24 ? ('fourCol_onlylineFormItem ' + className) : className;
        } else if (document.body.clientWidth > 1100) {
          className = colNum === 24 ? ('threeCol_onlylineFormItem ' + className) : className;
        } else {
          className = colNum === 24 ? ('twoCol_onlylineFormItem ' + className) : className;
        }
      }

      return (
        <Col span={colNum}
             key={field.fieldname}
             className={className}
             style={(fieldconfig.isVisible !== 1 || field.fieldconfig.isVisibleJS === 0) ? { display: 'none' } : { padding: '0 10px' }} >
          <FormItem
            key={fieldname}
            colon={false}
            label={displayname}
            {...layout}
          >
            <DynamicFieldView
              isCommonForm
              entityId={entityId}
              entityTypeId={entityTypeId}
              value={value[fieldname]}
              controlType={controltype}
              config={fieldconfig}
              value_name={value[fieldname + '_name']}
            />
          </FormItem>
        </Col>
      );
    });
  };
  render() {
    const { fields: allFields } = this.props;

    // 处理分组
    const noGroupFields = [];
    const groups = [];
    let lastGroup = null;
    Array.isArray(allFields) && allFields.forEach((field, index) => {
      if (field.controltype === 20) {
        lastGroup = {
          title: field.displayname,
          foldable: field.fieldconfig.foldable === 1,
          fields: [],
          isVisible: field.fieldconfig.isVisible === 1
        };
        groups.push(lastGroup);
        return;
      }
      if (lastGroup) {
        lastGroup.fields.push(field);
      } else {
        noGroupFields.push(field);
      }
    });

    return (
      <Form className={styles.dyformview}>
        <Row gutter={24} style={{ margin: 0 }}>
          {this.renderFields(noGroupFields)}
          {groups.map(group => (
            <FoldableGroup key={group.title} title={group.title} isVisible={group.isVisible} foldable={group.foldable} theme="light">
              {this.renderFields(group.fields)}
            </FoldableGroup>
          ))}
        </Row>
      </Form>
    );
  }
}

export default createJSEngineProxy(DynamicFormView, { type: 'DETAIL' });
