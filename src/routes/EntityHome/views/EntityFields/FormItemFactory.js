import React from 'react';
import { Form, Select, Input, Radio, Checkbox, message, DatePicker, Button } from 'antd';
import moment from 'moment';
import RelBusDataSource from './RelBusDataSource';
import { getIntlText } from '../../../../components/UKComponent/Form/IntlText';
import { queryDicTypes, queryDicOptions } from '../../../../services/dictionary';
import { queryList as queryDataSource } from '../../../../services/datasource';
import { query as queryEntity, queryFields, getreffieldsbyfield } from '../../../../services/entity';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

function toMomentFormat(format) {
  const defaultFormat = 'YYYY-MM-DD HH:mm:ss';
  if (!format) return defaultFormat;
  return format.replace(/y/g, 'Y')
    .replace(/d/g, 'D')
    .replace(/h/g, 'H');
}

class DefaultValueDate extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = event => {
    const val = event.target.checked ? 'now' : '';
    this.props.onChange(val);
  };

  render() {
    const { value, onChange } = this.props;
    const checked = value === 'now';
    return (
      <Checkbox checked={checked} onChange={this.handleChange}>当前</Checkbox>
    );
  }
}

class LimitValueDate extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = event => {
    if (event && Object.prototype.hasOwnProperty.call(event, 'target')) {
      const val = event.target.checked ? 'now' : '';
      this.props.onChange(val);
    } else {
      this.props.onChange(event && event.format('YYYY-MM-DD'));
    }
  };

  render() {
    const { value } = this.props;
    const checked = value === 'now';
    const mFormat = toMomentFormat('YYYY-MM-DD');
    const date = value ? moment(moment(value, 'YYYY-MM-DD').format(mFormat), mFormat) : undefined;
    return (
      <div style={{ display: 'flex' }}>
        <Checkbox checked={checked} onChange={this.handleChange}>当前</Checkbox>
        <div>{!checked ? <DatePicker value={date} onChange={this.handleChange} /> : null}</div>
      </div>
    );
  }
}

class SelectNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChange = val => {
    this.props.onChange(parseInt(val));
  };
  render() {
    const { value, children, restProps } = this.props;
    return (
      <Select value={`${value}`} onChange={this.handleChange} {...restProps}>
        {children}
      </Select>
    );
  }
}

// 单选数据源
class DicTypeSelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.shape({
      type: React.PropTypes.oneOf(['local', 'network']),
      sourceKey: React.PropTypes.string,
      sourceId: React.PropTypes.string
    }),
    onChange: React.PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
    this.fetchOptions();
  }

  fetchOptions = () => {
    queryDicTypes().then(result => {
      const options = result.data.fielddictype.map(item => ({
        id: item.dictypeid + '',
        label: item.dictypename
      }));
      this.setState({ options });
    });
  };

  parseValue = () => {
    const { value } = this.props;
    if (!value) return '';
    return value.sourceId;
  };

  handleChange = val => {
    this.props.onChange({
      type: 'local',
      sourceKey: 'dicitonary',
      sourceId: val
    });
  };

  render() {
    return (
      <Select value={this.parseValue()} onChange={this.handleChange}>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}

// 单选默认值，根据数据源，动态改变选项
class DefaultValueSingleSelect extends React.Component {
  static propTypes = {
    form: React.PropTypes.object,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      intervalId: this.watchDataSourceChange(),
      dicTypeId: undefined
    };
    // const dataSource = this.props.form.getFieldValue('dataSource');
    // if (dataSource && dataSource.sourceId) {
    //   this.state.dicTypeId = dataSource.sourceId;
    //   this.fetchOptions(dataSource.sourceId);
    // }
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  watchDataSourceChange = () => {
    let flag = true;
    const intervalId = setInterval(() => {
      if (flag) return flag = false; // 跳出第一次执行
      const dataSource = this.props.form.getFieldValue('dataSource_' + this.props.ctrlType);
      if (!dataSource || !dataSource.sourceId) { // 数据源是空
        if (this.state.options.length) {
          // this.setState({ options: [] });
          // this.props.onChange('');
        }
      } else {
        const dicTypeId = dataSource.sourceId;
        if (this.state.dicTypeId !== dicTypeId) {
          if (this.state.dicTypeId !== undefined) {
            this.props.onChange('');
          }
          this.fetchOptions(dataSource.sourceId);
          this.setState({ dicTypeId });
        }
      }
    }, 50);
    return intervalId;
  };

  fetchOptions = (dicTypeId) => {
    queryDicOptions(dicTypeId).then(result => {
      const options = result.data.fielddictypevalue.map(item => ({
        id: item.dataid + '',
        label: item.dataval
      }));
      this.setState({ options });
    });
  };

  render() {
    return (
      <Select value={this.props.value} onChange={this.props.onChange}>
        <Option value="">- 无 -</Option>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}

// 数据源数据源
class DataSourceSelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.oneOfType([
      React.PropTypes.shape({
        type: React.PropTypes.oneOf(['local', 'network']),
        // sourceKey: React.PropTypes.string,
        sourceId: React.PropTypes.string
      }),
      React.PropTypes.shape({
        sourceId: React.PropTypes.string,
        sourceName: React.PropTypes.string,
        entityId: React.PropTypes.string,
        entityName: React.PropTypes.string
      })
    ]),
    onChange: React.PropTypes.func,
    multiple: React.PropTypes.bool
  };

  static defaultProps = {
    multiple: false
  };

  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
    this.fetchOptions();
  }

  fetchOptions = () => {
    const params = {
      datasourcename: '',
      recstatus: 1,
      pageindex: 1,
      pagesize: 999
    };
    queryDataSource(params).then(result => {
      const options = result.data.pagedata.map(item => ({
        id: item.datasourceid + '',
        label: item.datasourcename,
        label_lang: item.datasourcename_lang,
        entityId: item.entityid,
        entityName: item.entityname
      }));
      this.setState({ options: options.filter(item => item.entityId) }); //过滤掉没有entityid 的数据
    });
  };

  parseValue = () => {
    if (this.props.multiple) { //多选
      const { value } = this.props;
      if (!value || !(value instanceof Array)) return [];
      return value.map(item => item.sourceId);
    } else {
      const { value } = this.props;
      if (!value) return '';
      return value.sourceId;
    }
  };

  handleChange = val => {
    if (this.props.multiple) { //多选
      const selectData = this.state.options.filter(item => (',' + val.join() + ',').indexOf(',' + item.id + ',') > -1);

      if (this.props.value instanceof Array && selectData instanceof Array) {
        for (let i = 0; i < this.props.value.length; i++) {
          for (let j = 0; j < selectData.length; j++) {
            if (this.props.value[i].sourceId !== selectData[j].id && this.props.value[i].entityId === selectData[j].entityId) {
              message.warning('已选择了实体为' + this.props.value[i].entityName + '的数据源【' + this.props.value[i].sourceName + '】');
              return;
            }
          }
        }
      }

      this.props.onChange(selectData.map(item => {
        return {
          sourceId: item.id,
          sourceName: item.label,
          entityId: item.entityId,
          entityName: item.entityName
        };
      }));
    } else {
      this.props.onChange({
        type: 'network',
        // sourceKey: 'dicitonary',
        sourceId: val
      });
    }
  };

  render() {
    return (
      <Select mode={this.props.multiple ? 'multiple' : 'single'} value={this.parseValue()} onChange={this.handleChange}>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{getIntlText('label', item)}</Option>
        ))}
      </Select>
    );
  }
}

//开关 switch
class SwitchSet extends React.Component {
  static propTypes = {
    onChange: React.PropTypes.func
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }


  handleChange = (type, e) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      [type]: e.target.value
    });
  };

  render() {
    const { value } = this.props;
    return (
      <ul>
        <li style={{ marginBottom: '6px' }}>
          开启时显示文案: <Input style={{ width: 395, marginLeft: '6px' }} value={value && value['1']} onChange={this.handleChange.bind(this, '1')} />
        </li>
        <li>
          关闭时显示文案: <Input style={{ width: 395, marginLeft: '6px' }} value={value && value['0']} onChange={this.handleChange.bind(this, '0')} />
        </li>
      </ul>
    );
  }
}

// 引用对象，来源对象选择
class OriginEntitySelect extends React.Component {
  static propTypes = {
    form: React.PropTypes.object,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      intervalId: this.watchControlFieldChange(),
      controlField: undefined
    };
    this.fetchOptions();
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  watchControlFieldChange = () => {
    let flag = true;
    const intervalId = setInterval(() => {
      if (flag) return flag = false; // 跳出第一次执行
      const controlField = this.props.form.getFieldValue('controlField');
      if (!controlField) {
        if (this.state.options.length) {
          this.setState({ options: [] });
          this.props.onChange('');
        }
      } else {
        if (this.state.controlField !== controlField) {
          this.setState({ controlField });
          this.fetchOptions(controlField);
        }
      }
    }, 50);
    return intervalId;
  };

  fetchOptions = (controlField) => {
    if (!controlField) return;
    getreffieldsbyfield(controlField).then(result => {
      const entityObj = result.data.entity;
      const options = [{
        id: entityObj.entityid + '',
        label: entityObj.entityname
      }];

      this.setState({ options });
      this.props.onChange(options[0].id);
    });
  };

  render() {
    return (
      <Select value={this.props.value} onChange={this.props.onChange} disabled>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}

// 引用对象字段，根据来源对象，动态改变选项
class OriginFieldSelect extends React.Component {
  static propTypes = {
    form: React.PropTypes.object,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      intervalId: this.watchControlFieldChange(),
      controlField: undefined
    };
    // const dataSource = this.props.form.getFieldValue('dataSource');
    // if (dataSource && dataSource.sourceId) {
    //   this.state.dicTypeId = dataSource.sourceId;
    //   this.fetchOptions(dataSource.sourceId);
    // }
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  watchControlFieldChange = () => {
    let flag = true;
    const intervalId = setInterval(() => {
      if (flag) return flag = false; // 跳出第一次执行
      const controlField = this.props.form.getFieldValue('controlField');
      if (!controlField) {
        if (this.state.options.length) {
          this.setState({ options: [] });
          this.props.onChange('');
        }
      } else {
        if (this.state.controlField !== controlField) {
          this.setState({ controlField });
          this.fetchOptions(controlField);
        }
      }
    }, 50);
    return intervalId;
  };

  fetchOptions = (controlField) => {
    getreffieldsbyfield(controlField).then(result => {
      const options = result.data.fields.map(item => ({
        id: item.fieldid,
        fieldname: item.fieldname,
        label: item.fieldlabel
      }));
      this.setState({ options });
      const flag = options.some(item => item.fieldname === this.props.value);
      if (options.length && !flag) {
        this.props.onChange(options[0].fieldname);
      }
    });
  };

  controlFieldFocus = () => {
    if (this.state.options.length === 0) {
      message.warning('请先选择控制字段');
    }
  }

  render() {
    return (
      <Select value={this.props.value} onChange={this.props.onChange} onFocus={this.controlFieldFocus}>
        {this.state.options.map(item => (
          <Option value={item.fieldname} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}

// 引用对象控制字段
class ControlFieldSelect extends React.Component {
  static propTypes = {
    fields: React.PropTypes.array,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  static defaultProps = {
    fields: []
  };

  render() {
    function isDataSourceField(field) {
      return field.controltype === 18;
    }
    return (
      <Select value={this.props.value} onChange={this.props.onChange}>
        {this.props.fields.filter(isDataSourceField).map(item => (
          <Option value={item.fieldid} key={item.fieldid}>{item.fieldlabel}</Option>
        ))}
      </Select>
    );
  }
}

// 表格控件，来源实体选择
class TableEntitySelect extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    parentEntityId: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
    this.fetchOptions();
  }

  fetchOptions = () => {
    const params = {
      EntityName: '',
      typeid: -1,
      status: 1,
      pageindex: 1,
      pagesize: 999
    };
    queryEntity(params).then(result => {
      const options = result.data.pagedata.filter(item => {
        return item.modeltype === 1 && item.relentityid === this.props.parentEntityId;
      }).map(item => ({
        id: item.entityid + '',
        label: item.entityname
      }));
      this.setState({ options });
    });
  };

  render() {
    return (
      <Select value={this.props.value} onChange={this.props.onChange}>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}

// 表格控件，标题字段选择
class TitleFieldSelect extends React.Component {
  static propTypes = {
    form: React.PropTypes.object,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      intervalId: this.watchOriginEntityChange(),
      originEntity: undefined
    };
    // const dataSource = this.props.form.getFieldValue('dataSource');
    // if (dataSource && dataSource.sourceId) {
    //   this.state.dicTypeId = dataSource.sourceId;
    //   this.fetchOptions(dataSource.sourceId);
    // }
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  watchOriginEntityChange = () => {
    let flag = true;
    const intervalId = setInterval(() => {
      if (flag) return flag = false; // 跳出第一次执行
      const originEntity = this.props.form.getFieldValue('entityId');
      if (!originEntity) {
        if (this.state.options.length) {
          this.setState({ options: [] });
          this.props.onChange('');
        }
      } else {
        if (this.state.originEntity !== originEntity) {
          this.setState({ originEntity });
          this.fetchOptions(originEntity);
        }
      }
    }, 50);
    return intervalId;
  };

  fetchOptions = (originEntity) => {
    queryFields(originEntity).then(result => {
      const options = result.data.entityfieldpros
        // 仅文本、单选、多选、日期、日期时间、数据源、选人、产品、产品系列、引用对象格式可供选择
        .filter(item => [1, 3, 4, 8, 9, 18, 25, 28, 29, 31].indexOf(item.controltype) !== -1)
        .map(item => ({
          id: item.fieldname + '',
          label: item.fieldlabel
        }));
      this.setState({ options });
      const flag = options.some(item => item.id === this.props.value);
      if (options.length && !flag) {
        this.props.onChange(options[0].id);
      }
    });
  };

  render() {
    return (
      <Select value={this.props.value} onChange={this.props.onChange}>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}


// 表格控件，批量新增字段选择
class BatchFieldSelect extends React.Component {
  static propTypes = {
    form: React.PropTypes.object,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      intervalId: this.watchOriginEntityChange(),
      originEntity: undefined
    };
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  watchOriginEntityChange = () => {
    let flag = true;
    const intervalId = setInterval(() => {
      if (flag) return flag = false; // 跳出第一次执行
      const originEntity = this.props.form.getFieldValue('entityId');
      if (!originEntity) {
        if (this.state.options.length) {
          this.setState({ options: [] });
          this.props.onChange('');
        }
      } else {
        if (this.state.originEntity !== originEntity) {
          this.setState({ originEntity });
          this.fetchOptions(originEntity);
        }
      }
    }, 50);
    return intervalId;
  };

  fetchOptions = (originEntity) => {
    queryFields(originEntity).then(result => {
      const options = result.data.entityfieldpros
        // 单选、数据源、选人、产品可供选择(且都是单选)
        .filter(item => {
          if (item.fieldconfig.multiple !== 1 && [3, 18, 25, 28, 1002, 1003, 1006].indexOf(item.controltype) !== -1) {
            return item;
          }
        })
        .map(item => ({
          id: item.fieldname + '',
          label: item.fieldlabel
        }));
      this.setState({ options });
      const flag = options.some(item => item.id === this.props.value);
      if (options.length && !flag) {
        this.props.onChange(options[0].id);
      }
    });
  };

  render() {
    return (
      <Select value={this.props.value} onChange={this.props.onChange}>
        {this.state.options.map(item => (
          <Option value={item.id} key={item.id}>{item.label}</Option>
        ))}
      </Select>
    );
  }
}

export default class FormItemFactory {

  constructor(form, entityFields, entityId, isEdit) {
    this.form = form;
    this.entityFields = entityFields;
    this.entityId = entityId;
    this.getFieldDecorator = form.getFieldDecorator;
    this.isEdit = isEdit;
  }

  create(type, ctrlType) {
    const fn = 'create' + type.replace(/^\w/, char => char.toUpperCase());
    return this[fn](+ctrlType);
  }

  createFieldLabel() {
    return (
      <FormItem label="字段名称" key="fieldLabel">
        {this.getFieldDecorator('fieldLabel', {
          rules: [{ required: true, message: '请输入字段名称' }]
        })(<Input placeholder="字段名称" />)}
      </FormItem>
    );
  }

  createDisplayName() {
    return (
      <FormItem label="显示名称" key="displayName">
        {this.getFieldDecorator('displayName', {
          rules: [{ required: true, message: '请输入显示名称' }]
        })(<Input placeholder="显示名称" />)}
      </FormItem>
    );
  }

  createRecStatus() {
    return (
      <FormItem label="状态" key="recStatus">
        {this.getFieldDecorator('recStatus', {
          initialValue: 1,
          rules: [{ required: true, message: '请选择状态' }]
        })(
          <SelectNumber>
            <Option value="1">启用</Option>
            <Option value="0">禁用</Option>
          </SelectNumber>,
        )}
      </FormItem>
    );
  }

  createTipContent() {
    return (
      <FormItem label="提示内容" key="tipContent">
        {this.getFieldDecorator('tipContent', {
          rules: [{ required: true, message: '请输入提示内容' }]
        })(<Input placeholder="提示内容" type="textarea" maxLength={200} />)}
      </FormItem>
    );
  }

  createTipColor() {
    return (
      <FormItem label="字体颜色" key="tipColor">
        {this.getFieldDecorator('tipColor', {
          initialValue: '#999999'
        })(<Input placeholder="字体颜色" type="color" />)}
      </FormItem>
    );
  }

  createOptions() {
    return (
      <FormItem label="选项值" key="Options">
        {this.getFieldDecorator('Options', {
          initialValue: '',
          rules: [{ required: true, message: '请选择选项值' }]
        })(<Input placeholder="选项值" />)}
      </FormItem>
    );
  }

  createDataSource(ctrlType) {
    switch (ctrlType) {
      case 18: // 数据源控件
        return (
          <FormItem label="数据源" key="dataSource">
            {this.getFieldDecorator('dataSource_' + ctrlType, { //表单中有部分字段是动态切换的 出现了字段名一样的数据 所有加_以区分 不然ant design会报错，说校验规则变为undefined 具体原因不详
              rules: [{ required: true, message: '请选择数据源' }]
            })(<DataSourceSelect />)}
          </FormItem>
        );
      default:
        return (
          <FormItem label="数据源" key="dataSource">
            {this.getFieldDecorator('dataSource_' + ctrlType, { //注意： 是否存在其他项 获取DataSource项的值  需要核对表单name值
              rules: [{ required: true, message: '请选择数据源' }]
            })(<DicTypeSelect />)}
          </FormItem>
        );
    }
  }

  createMultipleDataSource(ctrlType) {
    return (
      <FormItem label="数据源" key="multidataSource">
        {this.getFieldDecorator('dataSource_' + ctrlType, {
          rules: [{ required: true, message: '请选择数据源' }]
        })(<RelBusDataSource />)}
      </FormItem>
    );
  }

  switchValueRequire = (rule, value, callback) => {
    if (!value['0'] || !value['1']) {
      callback('请完成文案配置');
    } else {
      callback();
    }
  }

  createSwitch() {
    return (
      <FormItem label="文案配置" key="switchinfo">
        {this.getFieldDecorator('switchinfo', {
          rules: [{ required: true, message: '请完成文案配置' },
          {
            validator: this.switchValueRequire
          }]
        })(<SwitchSet />)}
      </FormItem>
    );
  }

  createDefaultValue(ctrlType) {
    switch (ctrlType) {
      case 3: // 单选
        return (
          <FormItem label="默认值" key="defaultValue">
            {this.getFieldDecorator('defaultValue')(
              <DefaultValueSingleSelect form={this.form} ctrlType={ctrlType} />
            )}
          </FormItem>
        );
      case 5: // 大文本
        return (
          <FormItem label="默认值" key="defaultValue">
            {this.getFieldDecorator('defaultValue')(
              <Input placeholder="默认值" type="textarea" />
            )}
          </FormItem>
        );
      case 8:
      case 9: // 时间/时间日期
        return (
          <FormItem label="默认值" key="defaultValue">
            {this.getFieldDecorator('defaultValue')(
              <DefaultValueDate />
            )}
          </FormItem>
        );
      case 33: //开关
        return (
          <FormItem label="默认值" key="defaultValue">
            {this.getFieldDecorator('defaultValue', {
              initialValue: 0,
              rules: [{ required: true, message: '请选择默认值' }]
            })(
              <Select>
                <Option value={1}>开启</Option>
                <Option value={0}>关闭</Option>
              </Select>
            )}
          </FormItem>
        );
      default:
        return (
          <FormItem label="默认值" key="defaultValue">
            {this.getFieldDecorator('defaultValue')(
              <Input placeholder="默认值" />
            )}
          </FormItem>
        );
    }
  }

  createMaxLength(ctrlType) {
    switch (ctrlType) {
      case 6:
        return (
          <FormItem label="字段长度" key="maxLength">
            {this.getFieldDecorator('maxLength', {
              initialValue: 13,
              rules: [{ required: true, message: '请选择字段长度' }]
            })(
              <SelectNumber>
                <Option value="1">1</Option>
                <Option value="2">2</Option>
                <Option value="5">5</Option>
                <Option value="10">10</Option>
                <Option value="13">13</Option>
                <Option value="20">20</Option>
              </SelectNumber>
            )}
          </FormItem>
        );
      case 7:
        return (
          <FormItem label="字段长度" key="maxLength">
            {this.getFieldDecorator('maxLength', {
              initialValue: 13,
              rules: [{ required: true, message: '请选择字段长度' }]
            })(
              <SelectNumber>
                <Option value="3">3</Option>
                <Option value="5">5</Option>
                <Option value="10">10</Option>
                <Option value="13">13</Option>
                <Option value="20">20</Option>
              </SelectNumber>
            )}
          </FormItem>
        );
      default:
        return (
          <FormItem label="字段长度" key="maxLength">
            {this.getFieldDecorator('maxLength', {
              initialValue: 200,
              rules: [{ required: true, message: '请选择字段长度' }]
            })(
              <SelectNumber>
                <Option value="20">20</Option>
                <Option value="50">50</Option>
                <Option value="100">100</Option>
                <Option value="200">200</Option>
                <Option value="500">500</Option>
                <Option value="1000">1000</Option>
              </SelectNumber>
            )}
          </FormItem>
        );
    }
  }

  createDecimalsLength() {
    return (
      <FormItem label="小数点位数" key="decimalsLength">
        {this.getFieldDecorator('decimalsLength', {
          initialValue: 2,
          rules: [{ required: true, message: '请选择小数点位数' }]
        })(
          <SelectNumber>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
            <Option value="5">5</Option>
          </SelectNumber>
        )}
      </FormItem>
    );
  }

  createFormat(ctrlType) {
    return (
      <FormItem label="显示格式" key="format">
        {this.getFieldDecorator('format', {
          initialValue: ctrlType === 8 ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss',
          rules: [{ required: true, message: '请输入显示格式' }]
        })(<Input placeholder="显示格式" />)}
      </FormItem>
    );
  }

  createLimitDate() {
    return (
      <FormItem label="设置限制日期(不选则不限制)" key="limitDate">
        {this.getFieldDecorator('limitDate', {
          initialValue: '',
          rules: [{ message: '请选择限制日期' }]
        })(<LimitValueDate />)}
      </FormItem>
    );
  }

  createHeadShape() {
    return (
      <FormItem label="显示样式" key="headShape">
        {this.getFieldDecorator('headShape', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择显示样式' }]
        })(
          <RadioGroup>
            <Radio value={0}>方形</Radio>
            <Radio value={1}>圆形</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createFoldable() {
    return (
      <FormItem label="是否可折叠" key="foldable">
        {this.getFieldDecorator('foldable', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择是否可折叠' }]
        })(
          <RadioGroup>
            <Radio value={0}>非折叠</Radio>
            <Radio value={1}>可折叠</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createPictureType() {
    return (
      <FormItem label="图片类型" key="pictureType">
        {this.getFieldDecorator('pictureType', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择图片类型' }]
        })(
          <RadioGroup>
            <Radio value={0}>拍照+相册选择</Radio>
            <Radio value={1}>仅拍照</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createMultiple(ctrlType) {
    return (
      <FormItem label="选择类型" key="multiple">
        {this.getFieldDecorator('multiple', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择选择类型' }]
        })(
          <RadioGroup disabled={ctrlType === 18 && this.isEdit}>
            <Radio value={0}>单选</Radio>
            <Radio value={1}>多选</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createModeType() {
    return (
      <FormItem label="模式选择" key="modeType">
        {this.getFieldDecorator('modeType', {
          normalize: (value) => (value === 1 ? value : 0),
          initialValue: 0,
          rules: [{ required: true, message: '请选择模式' }]
        })(
          <RadioGroup>
            <Radio value={0}>正常</Radio>
            <Radio value={1}>高级</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createAllowAdd() {
    return (
      <FormItem label="是否允许快速新增" key="allowAdd">
        {this.getFieldDecorator('allowadd', {
          initialValue: 0
        })(
          <Radio.Group>
            <Radio value={1}>是</Radio>
            <Radio value={0}>否</Radio>
          </Radio.Group>
        )}
      </FormItem>
    );
  }

  createRelateRule() {
    return (
      <FormItem label="联动规则" key="relateRule">
        {this.getFieldDecorator('relateRule')(
          <Input placeholder="联动规则" type="textarea" />
        )}
      </FormItem>
    );
  }

  createLimit() {
    return (
      <FormItem label="限制个数" key="limit">
        {this.getFieldDecorator('limit', {
          initialValue: 3,
          rules: [{ required: true, message: '请选择限制个数' }]
        })(
          <SelectNumber>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
            <Option value="5">5</Option>
            <Option value="6">6</Option>
          </SelectNumber>
        )}
      </FormItem>
    );
  }

  createEntityId() {
    return (
      <FormItem label="来源实体" key="entityId">
        {this.getFieldDecorator('entityId', {
          rules: [{ required: true, message: '请选择来源实体' }]
        })(<TableEntitySelect parentEntityId={this.entityId} />)}
      </FormItem>
    );
  }

  createTitleField() {
    return (
      <FormItem label="标题字段" key="titleField">
        {this.getFieldDecorator('titleField', {
          rules: [{ required: true, message: '请选择标题字段' }]
        })(<TitleFieldSelect form={this.form} />)}
      </FormItem>
    );
  }

  createImport() {
    return (
      <FormItem label="是否支持导入" key="import">
        {this.getFieldDecorator('import', {
          initialValue: 0
        })(
          <RadioGroup>
            <Radio value={0}>不支持</Radio>
            <Radio value={1}>支持</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createBatch() {
    return (
      <FormItem label="是否支持批量新增" key="batch">
        {this.getFieldDecorator('batch', {
          initialValue: 0
        })(
          <RadioGroup>
            <Radio value={0}>不支持</Radio>
            <Radio value={1}>支持</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createBatchAddField() {
    return (
      <FormItem label="批量新增字段" key="batchAddField">
        {this.getFieldDecorator('batchAddField', {
          rules: [{ required: true, message: '请选择标题字段' }]
        })(<BatchFieldSelect form={this.form} />)}
      </FormItem>
    );
  }

  createDataRange() {
    return (
      <FormItem label="数据范围" key="dataRange">
        {this.getFieldDecorator('dataRange', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择数据范围' }]
        })(
          <RadioGroup>
            <Radio value={0}>全公司</Radio>
            <Radio value={1}>按角色权限</Radio>
            <Radio value={2}>个人</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createOriginEntity() {
    return (
      <FormItem label="来源对象" key="originEntity">
        {this.getFieldDecorator('originEntity', {
          rules: [{ required: true, message: '请选择来源对象' }]
        })(<OriginEntitySelect form={this.form} />)}
      </FormItem>
    );
  }

  createOriginField() {
    return (
      <FormItem label="来源字段" key="originFieldname">
        {this.getFieldDecorator('originFieldname', {
          rules: [{ required: true, message: '请选择来源字段' }]
        })(<OriginFieldSelect form={this.form} />)}
      </FormItem>
    );
  }

  createControlField() {
    return (
      <FormItem label="控制字段" key="controlField">
        {this.getFieldDecorator('controlField', {
          rules: [{ required: true, message: '请选择控制字段' }]
        })(<ControlFieldSelect fields={this.entityFields} />)}
      </FormItem>
    );
  }

  createEncrypted() {
    return (
      <FormItem label="是否加密" key="encrypted">
        {this.getFieldDecorator('encrypted', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择是否加密' }]
        })(
          <RadioGroup>
            <Radio value={0}>普通文本</Radio>
            <Radio value={1}>加密文本</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createScanner() {
    return (
      <FormItem label="是否支持扫描" key="scanner">
        {this.getFieldDecorator('scanner', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择是否支持扫描' }]
        })(
          <RadioGroup>
            <Radio value={0}>普通文本</Radio>
            <Radio value={1}>支持扫描</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createTextType() {
    return (
      <FormItem label="文本类型" key="textType">
        {this.getFieldDecorator('textType', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择文本类型' }]
        })(
          <RadioGroup>
            <Radio value={0}>普通文本</Radio>
            <Radio value={1}>富文本</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }

  createSeparator() {
    return (
      <FormItem label="使用千分位" key="separator">
        {this.getFieldDecorator('separator', {
          initialValue: 0,
          rules: [{ required: true, message: '请选择是否使用千分位' }]
        })(
          <RadioGroup>
            <Radio value={0}>否</Radio>
            <Radio value={1}>是</Radio>
          </RadioGroup>
        )}
      </FormItem>
    );
  }
}
