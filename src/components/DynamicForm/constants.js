import React, { Component } from 'react';

import InputText from './controls/InputText';
import InputRecName from './controls/InputRecName';
import TipText from './controls/TipText';
import SelectSingle from './controls/SelectSingle';
import SelectMultiple from './controls/SelectMultiple';
import InputTextarea from './controls/InputTextarea';
import InputInteger from './controls/InputInteger';
import InputDecimal from './controls/InputDecimal';
import Date from './controls/Date';
import DateTime from './controls/DateTime';
import InputMobile from './controls/InputMobile';
import InputMail from './controls/InputMail';
import InputTelephone from './controls/InputTelephone';
import InputAddress from './controls/InputAddress';
import Location from './controls/Location';
import Avatar from './controls/Avatar';
import SelectRegion from './controls/SelectRegion';
import SelectDepartment from './controls/SelectDepartment';
import SelectDataSource from './controls/SelectDataSource';
import Group from './controls/Group';
import Picture from './controls/Picture';
import Attachment from './controls/Attachment';
import RelTable from './controls/RelTable';
import SelectUser from './controls/SelectUser';
import SelectProduct from './controls/SelectProduct';
import SelectProductBigData from './controls/SelectProductBigData';
import SelectEntityType from './controls/SelectEntityType';
import SelectProductSerial from './controls/SelectProductSerial';
import RelObject from './controls/RelObject';

function presetProps(props, WrappedComponent) {
  return class NewComponent extends Component {
    render() {
      return (
        <WrappedComponent
          {...props}
          {...this.props}
        />
      );
    }
  };
}

const AuditSelect = presetProps({
  dataSource: {
    sourceId: '37',
    sourceKey: 'dictionary'
  }
}, SelectSingle);

const StatusSelect = presetProps({
  dataSource: {
    sourceId: '27',
    sourceKey: 'dictionary'
  }
}, SelectSingle);

export const controlMap = {
  1: InputText,
  2: TipText,
  3: SelectSingle,
  4: SelectMultiple,
  5: InputTextarea,
  6: InputInteger,
  7: InputDecimal,
  8: Date,
  9: DateTime,
  10: InputMobile,
  11: InputMail,
  12: InputTelephone,
  13: InputAddress,
  14: Location,
  15: Avatar,
  16: SelectRegion,
  17: SelectDepartment,
  18: SelectDataSource,
  19: null,
  20: Group,
  21: null,
  22: Picture,
  23: Attachment,
  24: RelTable,
  25: SelectUser,
  26: null,
  27: null,
  28: SelectProduct,
  // 28: SelectProductBigData,
  29: SelectProductSerial,
  30: null,
  31: RelObject,

  1002: SelectUser, // 1002 创建人
  1003: SelectUser, // 1003 更新人
  1004: DateTime, // 1004 创建时间
  1005: DateTime, // 1005 更新时间
  1006: SelectUser, // 1006 负责人
  // 1007: AuditSelect, // 1007 审批状态
  // 1008: StatusSelect, // 1008 记录状态
  1009: SelectEntityType, // 1009 记录类型
  1011: DateTime, // 1011 活动时间
  1012: InputRecName // 1012 实体名称
};

