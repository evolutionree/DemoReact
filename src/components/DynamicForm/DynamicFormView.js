import React, { PropTypes } from 'react';
import { Form, Row, Col } from 'antd';
import createJSEngineProxy from './createJSEngineProxy';
import FoldableGroup from './FoldableGroup';
import DynamicFieldView from './DynamicFieldView';
import IntlText from '../UKComponent/Form/IntlText';
import styles from './styles.less';
import { getSlinceFileds } from './DynamicFormBase';

const FormItem = Form.Item;
const onlylineField = [2, 5, 15, 22, 23, 24];
const formItemWrap_hasNoBackground_field = [2, 15, 20, 21, 22, 23, 24];

class DynamicFormView extends React.Component {
  static propTypes = {
    entityTypeId: PropTypes.string,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        fieldname: PropTypes.string.isRequired,
        displayname: PropTypes.string.isRequired,
        controltype: PropTypes.number.isRequired,
        fieldconfig: PropTypes.object.isRequired
      })
    ),
    value: PropTypes.object.isRequired,
    horizontal: PropTypes.bool,
    cols: PropTypes.number // 单个表单项所占栅格宽 没有传 则默认走系统计算（超1400宽的客户端三列， 否则两列展示）
  }

  static defaultProps = {
    horizontal: false
  }

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
  }

  getFormItemLayout = () => {
    return this.getFormLayout() === 'horizontal' ? { labelCol: { span: 6 }, wrapperCol: { span: 18 } } : null;
  }

  renderFields = fields => {
    const { value, entityId, entityTypeId, cols } = this.props;
    // filter筛选条件加上不显示的判断
    return fields
      .filter(field => {
        return field.controltype !== 30 && (field.fieldconfig.isVisibleJS === 1 || (field.fieldconfig.isVisible === 1 && field.fieldconfig.isVisibleJS !== 0));
      })
      .map(field => {
        const { fieldname, displayname, controltype, fieldconfig } = field;
        const layout = this.getFormItemLayout(field.fieldname);

        let colNum = 24;
        if (
          onlylineField.indexOf(field.controltype) > -1 ||
          (field.controltype === 25 && field.fieldconfig.multiple === 1)
        ) {
          colNum = 24;
        } else if (this.props.cols) {
          colNum = this.props.cols;
        } else if (document.body.clientWidth > 1500) {
          colNum = 6;
        } else if (document.body.clientWidth > 1100) {
          colNum = 8;
        } else {
          colNum = 12;
        }

        // TODO: 表单查看 项 用样式区分label和值项
        let className = formItemWrap_hasNoBackground_field.indexOf(field.controltype) > -1 ? '' : 'hasBackground';

        if (!this.props.cols) {
          const isHorizontal = this.getFormLayout() === 'horizontal';
          if (isHorizontal) {
            if (colNum === 24) {
              className = 'twoCol_onlylineFormItem ' + className;
              if (document.body.clientWidth > 1100) className = 'threeCol_onlylineFormItem ' + className;
              if (document.body.clientWidth > 1500) className = 'fourCol_onlylineFormItem ' + className;
            } else if ([6, 8].includes(colNum)) {
              className = 'height50Col_onlylineFormItem ' + className;
            }
          } else if (colNum !== 24) {
            className = 'height79Col_onlylineFormItem ' + className;
          }
        }

        return (
          <Col span={colNum} key={field.fieldname} className={className} style={{ padding: '0 10px' }}>
            <FormItem key={fieldname} colon={false} label={displayname} {...layout}>
              <DynamicFieldView
                isCommonForm
                fieldname={field.fieldname}
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
  }

  // 由于每一项内容长度不一样，导致每个col的高度可能不一致
  // 根据colNum拆分一行有多少个Col，再插入Row
  slinceFileds = fields => {
    const fieldsArr = this.renderFields(fields);
    const resultFields = getSlinceFileds(fieldsArr);
    return resultFields;
  }
  render() {
    const { fields: allFields } = this.props;

    // 处理分组
    const noGroupFields = [];
    const groups = [];
    let lastGroup = null;
    Array.isArray(allFields) &&
      allFields.forEach((field, index) => {
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
            <FoldableGroup
              key={group.title}
              title={group.title}
              isVisible={group.isVisible}
              foldable={group.foldable}
              theme="light"
            >
              {this.renderFields(group.fields)}
            </FoldableGroup>
          ))}
        </Row>
      </Form>
    );
  }
}

export default createJSEngineProxy(DynamicFormView, { type: 'DETAIL' });
