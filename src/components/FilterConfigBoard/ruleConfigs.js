import React from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import IPermissionRangeSelect from './renders/IPermissionRangeSelect';
import ISingleUserSelect from './renders/ISingleUserSelect';
import IDataPicker from './renders/IDataPicker';
import INumber from './renders/INumber';
import INumberRange from './renders/INumberRange';
import IText from './renders/IText';
import ISelectMultiple from './renders/ISelectMultiple';
import ISelectDataSource from './renders/ISelectDataSource';
import ISelectDepartment from './renders/ISelectDepartment';
import ISelectProduct from './renders/ISelectProduct';
import ISelectProductSerial from './renders/ISelectProductSerial';
import ISelectRecordStatus from './renders/ISelectRecordStatus';
import ISelectEntityType from './renders/ISelectEntityType';
import IInputDayNumber from './renders/IInputDayNumber';
import ISelectNull from './renders/ISelectNull';
import ISelectRole from './renders/ISelectRole';
import ISelectBool from './renders/ISelectBool';

export const supportControlTypes = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 22, 23, 25, 28, 29, 31, 1004, 1005, 1002, 1003, 1006, 1008, 1009, 1011, 1012, 2001, 2002, 2003, 2004, 2005
];

export const ruleTypes = {
  系统字段: 0,
  其他字段: 1,
  SQL: 2,
  关联实体字段: 10,
  关联独立实体字段: 11,
  流程字段: 20
};

export const ruleCategories = [{
  desc: '文本类',
  controlTypes: [1, 2, 5, 10, 11, 12, 13, 14, 31, 1012],
  operators: [
    { name: 'ilike', value: 'ilike' },
    { name: '=', value: '=' }
  ],
  renders: [{
    operators: ['ilike', '='],
    defaultValue: { dataVal: '' },
    render: (value, onChange) => (<IText value={value} onChange={onChange} />)
  }]
}, {
  desc: '数字类',
  controlTypes: [6, 7],
  operators: [
    { name: '>', value: '>' },
    { name: '<', value: '<' },
    { name: '≥', value: '>=' },
    { name: '≤', value: '<=' },
    { name: 'between', value: 'between' }
  ], // TODO , 'between'
  renders: [{
    operators: ['>', '<', '>=', '<='],
    defaultValue: {},
    render: (value, onChange) => (<INumber value={value} onChange={onChange} />)
  }, {
    operators: ['between'],
    defaultValue: {},
    validator: (value, operator, controlType) => {
      const { dataVal } = value;
      if (!dataVal) return '请输入最大最小值';
      const [min, max] = dataVal.split(':');
      if (!min) return '请输入最小值';
      if (!max) return '请输入最大值';
      if (+min >= max) {
        return '最小值必须小于最大值';
      }
    },
    render: (value, onChange) => (<INumberRange value={value} onChange={onChange} />)
  }]
}, {
  desc: '日期类',
  controlTypes: [8],
  operators: [
    // { name: '=', value: '=' },
    // { name: '!=', value: '!=' },
    { name: '>', value: '>' },
    { name: '<', value: '<' },
    { name: '≥', value: '>=' },
    { name: '≤', value: '<=' },
    { name: '到现在≥', value: '>=now' },
    { name: '到现在≤', value: '<=now' }
  ],
  renders: [{
    operators: ['>', '<', '>=', '<='],
    defaultValue: {},
    render: (value, onChange) => (<IDataPicker value={value} onChange={onChange} />)
  }, {
    operators: ['>=now', '<=now'],
    defaultValue: {},
    render: (value, onChange) => (<IInputDayNumber value={value} onChange={onChange} placeholder="输入天数" />),
    validator: (value, operator, controlType) => {
      const { dataVal } = value;
      if (dataVal !== undefined) {
        const str = dataVal + '';
        if (!/^-?\d+$/.test(str)) {
          return '请输入整数天数';
        }
      }
    }
  }]
}, {
  desc: '日期时间类',
  controlTypes: [1004, 1005, 1011, 9],
  operators: [
    // { name: '=', value: '=' },
    // { name: '!=', value: '!=' },
    { name: '>', value: '>' },
    { name: '<', value: '<' },
    { name: '≥', value: '>=' },
    { name: '≤', value: '<=' },
    { name: '到现在≥', value: '>=now' },
    { name: '到现在≤', value: '<=now' }
  ],
  renders: [{
    operators: ['>', '<', '>=', '<='],
    defaultValue: {},
    render: (value, onChange) => (<IDataPicker value={value} onChange={onChange} />)
  }, {
    operators: ['>=now', '<=now'],
    defaultValue: {},
    validator: (value, operator, controlType) => {
      const { dataVal } = value;
      if (dataVal !== undefined) {
        const str = dataVal + '';
        if (!/^-?\d+$/.test(str)) {
          return '请输入整数天数';
        }
      }
    },
    render: (value, onChange) => (<IInputDayNumber value={value} onChange={onChange} placeholder="输入天数" />)
  }]
}, {
  desc: '选人类',
  controlTypes: [1002, 1003, 1006, 25, 2001],
  operators: [
    { name: '=', value: '=' },
    { name: '!=', value: '!=' },
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['=', '!='],
    defaultValue: { dataVal: '{currentUser}' },
    render: (value, onChange) => (<ISingleUserSelect value={value} onChange={onChange} />)
  }, {
    operators: ['in', 'not in'],
    defaultValue: { dataVal: '{}' },
    render: (value, onChange) => (<IPermissionRangeSelect value={value} onChange={onChange} />)
  }]
}, {
  desc: '单选多选',
  controlTypes: [3, 4],
  operators: [
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['in', 'not in'],
    defaultValue: {},
    render: (value, onChange, options) => (<ISelectMultiple value={value} onChange={onChange} options={options} />)
  }]
}, {
  desc: '数据源',
  controlTypes: [18],
  operators: [
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['in', 'not in'],
    defaultValue: {},
    render: (value, onChange, options) => (<ISelectDataSource value={value} onChange={onChange} options={options} />)
  }]
}, {
  desc: '团队组织',
  controlTypes: [17, 2002, 2003],
  operators: [
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['in', 'not in'],
    defaultValue: {},
    render: (value, onChange) => (<ISelectDepartment value={value} onChange={onChange} />)
  }]
}, {
  desc: '产品',
  controlTypes: [28],
  operators: [
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['in', 'not in'],
    defaultValue: {},
    render: (value, onChange) => (<ISelectProduct value={value} onChange={onChange} />)
  }]
}, {
  desc: '产品系列',
  controlTypes: [29],
  operators: [
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['in', 'not in'],
    defaultValue: {},
    render: (value, onChange) => (<ISelectProductSerial value={value} onChange={onChange} />)
  }]
}, {
  desc: '记录状态',
  controlTypes: [1008],
  operators: [
    { name: '=', value: '=' }
  ],
  renders: [{
    operators: ['='],
    defaultValue: { dataVal: 1 },
    render: (value, onChange) => (<ISelectRecordStatus value={value} onChange={onChange} />)
  }]
}, {
  desc: '实体类型',
  controlTypes: [1009],
  operators: [
    { name: '=', value: '=' }
  ],
  renders: [{
    operators: ['='],
    defaultValue: { dataVal: '' },
    render: (value, onChange) => (<ISelectEntityType value={value} onChange={onChange} />)
  }]
}, {
  desc: '图片附件类',
  controlTypes: [22, 23],
  operators: [
    { name: '=', value: '=' }
  ],
  renders: [{
    operators: ['='],
    defaultValue: { dataVal: 'NOT NULL' },
    render: (value, onChange) => (<ISelectNull value={value} onChange={onChange} />)
  }]
}, {
  desc: '发起人角色',
  controlTypes: [2004],
  operators: [
    { name: 'in', value: 'in' },
    { name: 'not in', value: 'not in' }
  ],
  renders: [{
    operators: ['in', 'not in'],
    defaultValue: {},
    render: (value, onChange) => (<ISelectRole value={value} onChange={onChange} />)
  }]
}, {
  desc: '布尔选择',
  controlTypes: [2005],
  operators: [
    { name: '=', value: '=' }
  ],
  renders: [{
    operators: ['='],
    defaultValue: { dataVal: 1 },
    render: (value, onChange) => (<ISelectBool value={value} onChange={onChange} />)
  }]
}];

export function getConfigByControlType(controlType) {
  return _.find(ruleCategories, cat => {
    return cat.controlTypes.indexOf(controlType) !== -1;
  });
}

export function getOperators(controlType) {
  const conf = getConfigByControlType(controlType);
  return conf ? conf.operators : [];
}

export function getDefaultOperator(controlType) {
  return getOperators(controlType)[0].value;
}

export function getDefaultRuleData(controlType, operator) {
  const renderer = getRuleDataRenderer(controlType, operator);
  return renderer.defaultValue;
}

export function getRuleDataRenderer(controlType, operator) {
  const conf = getConfigByControlType(controlType);
  if (!conf) throw new Error('渲染ruledata控件出错');
  const render = _.find(conf.renders, item => {
    const strOperator = typeof operator === 'object' ? operator.value : operator;
    return item.operators.indexOf(strOperator) !== -1;
  });
  if (!render) throw new Error('渲染ruledata控件出错');
  return render;
}

export function checkSupport(controlType) {
  return supportControlTypes.indexOf(controlType) !== -1;
}

export function getValidator(controlType, operator) {
  try {
    const render = getRuleDataRenderer(controlType, operator);
    if (render && render.validator) {
      return render.validator;
    }
  } catch (e) {
    console.error('获取校验规则出错');
  }
}
