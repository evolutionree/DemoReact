import React, { PropTypes, Component } from 'react';
import { Radio, Select, Input } from 'antd';
import classnames from 'classnames';
import * as _ from 'lodash';
import { queryRoles } from '../../../../../services/role';
import SelectNumber from '../../../../../components/SelectNumber';
import SelectUser from '../../../../../components/DynamicForm/controls/SelectUser';
import DepartmentSelect from '../../../../../components/DepartmentSelect';
import styles from './styles.less';

const Option = Select.Option;
const TextArea = Input.TextArea;

const userSelf = [1]; // 让用户自己选择审批人
const special = [2]; // 指定审批人
const specialRole = [4]; // 指定审批人的角色
const teamAndPost = [5, 8, 801, 802, 11, 111, 112, 116]; // 指定审批人所在团队及职位
const teamAndRole = [6, 9, 901, 902, 10, 101, 102, 106]; // 指定审批人所在团队及角色
const initator = [7]; // 流程发起人
const reportRelation = [15]; // 汇报关系
const customs = [16]; // 自定义审批人


const SelectLeader = (props) => {
  const { type, currentType, fieldValue, onSelectChange, style, ...rest } = props;
  const isEquality = Array.isArray(type) ? type.includes(currentType) : type === currentType;
  return (
    <Select
      style={{ width: 135, ...style }}
      value={isEquality ? fieldValue : ''}
      onChange={onSelectChange}
      disabled={!isEquality}
      placeholder="请选择是否领导"
      {...rest}
    >
      <Option value="">请选择是否领导</Option>
      <Option value="1">是</Option>
      <Option value="0">否</Option>
    </Select>
  );
};

const SelectRole = ({ value, value_name, onChange, isReadOnly, allRoles }) => {
  const val = value ? value.split(',') : [];
  function onSelectChange(arrVal) {
    onChange(arrVal.join(','));
  }
  return (
    <div className={styles.selectrole} style={{ width: '260px' }} title={value_name}>
      <div className={classnames([styles.selectrolename, {
        [styles.empty]: !value, [styles.disabled]: isReadOnly === 1
      }])}>{value_name || '请选择角色'}</div>
      <Select
        value={val}
        onChange={onSelectChange}
        disabled={isReadOnly === 1}
        placeholder="请选择角色"
        multiple
      >
        {allRoles.map(role => (
          <Option key={`${role.id}`}>{role.name}</Option>
        ))}
      </Select>
    </div>
  );
};

const SelectField = ({ keys = 'fieldname', value, onChange, disabled, fields, placeholder, style }) => {
  function onSelectChange(fieldname) {
    if (!fieldname) return onChange();
    const fieldlabel = _.find(fields, [[keys], fieldname]).displayname;
    onChange(fieldname, fieldlabel);
  }
  return (
    <Select
      value={value}
      onChange={onSelectChange}
      disabled={disabled}
      placeholder={placeholder}
      style={{ width: 230, ...style }}
    >
      {fields.map(item => <Option key={item[keys]}>{item.displayname}</Option>)}
    </Select>
  );
};

/**
 * 1	让用户自己选择审批人	0
  2	指定审批人	0
  7	流程发起人	0
  3	会审	1
  0	发起审批	0
  -1	结束审批	0
  5	指定审批人所在团队(特定)	0
  4	指定审批人的角色(特定)	0
  6	指定审批人所在团队及角色(特定)	0
  8	当前审批人所在团队(非下级)	0
  9	当前审批人所在团队及角色(非下级)	0
  10	当前审批人所在团队的上级团队及角色(非下级)	0
  11	当前审批人所在团队的上级团队(非下级)	0
 */
class SelectFlowUser extends Component {
  static propTypes = {
    entities: PropTypes.array,
    value: PropTypes.shape({
      type: PropTypes.number.isRequired,
      data: PropTypes.object
    }),
    onChange: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      allRoles: []
    };
  }

  componentDidMount() {
    this.fetchAllRoles();
  }

  fetchAllRoles = () => {
    const params = { pageIndex: 1, pageSize: 9999, roleName: '', groupId: '' };
    queryRoles(params).then(result => {
      const roles = result.data.page.map(item => ({
        name: item.rolename,
        id: item.roleid
      }));
      this.setState({ allRoles: roles });
    });
  };

  onDataChange = (keyValues) => {
    const { onChange, value } = this.props;
    onChange({
      ...value,
      data: {
        ...value.data,
        ...keyValues
      }
    });
  };

  onRadioChange = event => {
    const typeArr = event.target.value;
    const type = typeArr[0];
    this.onTypeChange(type);
  };

  onTypeChange = type => {
    // 初始化data
    const data = {};
    this.props.onChange({
      type,
      data
    });
  };

  onSelectChange = (field, e) => this.onDataChange({ [field]: (e && e.target) ? e.target.value : e });

  render() {
    const { entities, value = {} } = this.props;
    const { allRoles } = this.state;
    const { type, data } = value;

    const radioStyle = {
      display: 'block',
      marginRight: '700px'
    };

    let formFields = [];
    let userFields = [];
    let formTeamFields = [];
    let reportrelationList = [];

    if (entities && entities[0]) {
      formFields = entities[0].forms;
      userFields = entities[0].fields.filter(field => [25, 1002, 1003, 1006].indexOf(field.controltype) !== -1);
      formTeamFields = entities[0].fields.filter(field => [17].indexOf(field.controltype) !== -1);
      reportrelationList = entities[0].reportrelationList;
    }

    const reportrelationdata = typeof data.reportrelation === 'string' ? JSON.parse(data.reportrelation) : data.reportrelation;

    return (
      <div className={styles.selectFlowUser}>
        <Radio.Group onChange={this.onRadioChange} style={{ width: '100%' }}>
          {/* type 1 */}
          <Radio style={radioStyle} checked={_.includes(userSelf, type)} value={userSelf}>让用户自己选择审批人</Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }} />

          {/* type 2 */}
          <Radio style={radioStyle} checked={_.includes(special, type)} value={special}>
            指定审批人
          </Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <SelectUser
              dataRange={1}
              placeholder="请选择审批人"
              style={{ width: '260px', height: 'inherit' }}
              value={_.includes(special, type) ? data.userid : ''}
              value_name={_.includes(special, type) ? data.username : ''}
              onChange={() => { }}
              onChangeWithName={({ value, value_name }) => {
                this.onDataChange({ userid: value, username: value_name });
              }}
              isReadOnly={_.includes(special, type) ? 0 : 1}
              multiple={1}
            />
          </div>

          {/* type 4 */}
          <Radio style={radioStyle} checked={_.includes(specialRole, type)} value={specialRole}>
            指定审批人的角色
          </Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <SelectRole
              placeholder="请选择角色"
              value={_.includes(specialRole, type) ? data.roleid : ''}
              value_name={_.includes(specialRole, type) ? data.rolename : ''}
              onChange={(values) => {
                if (values) {
                  const labels = values.split(',').map(id => _.find(allRoles, ['id', id]).name);
                  this.onDataChange({
                    roleid: values,
                    rolename: labels.join(',')
                  });
                } else {
                  this.onDataChange({ roleid: '', rolename: '' });
                }
              }}
              isReadOnly={_.includes(specialRole, type) ? 0 : 1}
              allRoles={allRoles}
            />
          </div>

          {/*5 指定审批人所在团队(特定)*/}
          {/*8 当前审批人所在团队(非下级)*/}
          {/*11 当前审批人所在团队的上级团队(非下级)*/}
          {/* type 5 */}
          <Radio style={radioStyle} checked={_.includes(teamAndPost, type)} value={teamAndPost}>
            指定审批人所在团队及职位
          </Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <SelectNumber
              value={_.includes(teamAndPost, type) ? type : 5}
              onChange={this.onTypeChange}
              disabled={!_.includes(teamAndPost, type)}
              style={{ width: '260px' }}
            >
              <Option key="5">特定团队</Option>
              <Option key="8">上一步骤处理人所在团队</Option>
              <Option key="11">上一步骤处理人所在团队的上级团队</Option>
              <Option key="801">流程发起人所在团队</Option>
              <Option key="111">流程发起人所在团队的上级团队</Option>
              <Option key="802">表单中用户所在团队</Option>
              <Option key="112">表单中用户所在团队的上级团队</Option>
              <Option key="116">表单中的团队</Option>
            </SelectNumber>
            {
              type === 5 &&
              <DepartmentSelect
                multiple
                value={type === 5 ? (data.deptid ? data.deptid.split(',') : []) : []}
                onChange={(values, labels) => {
                  this.onDataChange({ deptid: values.join(','), deptname: labels.join(',') });
                }}
                disabled={type !== 5}
                width="260px"
              />
            }
            {
              _.includes([802, 112, 116], type) &&
              <SelectField
                keys="entityid"
                style={{ width: 160 }}
                value={_.includes([802, 112, 116], type) ? data.entityid : undefined}
                placeholder="请选择表单"
                onChange={(entityid, fieldlabel) => this.onDataChange({ entityid, fieldlabel })}
                fields={formFields}
              />
            }
            {
              _.includes([116], type) &&
              <SelectField
                value={_.includes([116], type) ? data.fieldname : undefined}
                placeholder="请选择表单团队字段"
                onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
                fields={formTeamFields}
              />
            }
            {
              _.includes([802, 112], type) &&
              <SelectField
                value={_.includes([802, 112], type) ? data.fieldname : ''}
                placeholder="请选择表单用户字段"
                onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
                fields={userFields}
              />
            }
            <SelectLeader
              currentType={type}
              type={teamAndPost}
              fieldValue={data.isleader}
              onChange={this.onSelectChange.bind(this, 'isleader')}
              placeholder="请选择是否领导"
            />
          </div>


          {/* 6 指定审批人所在团队及角色(特定)
              9 当前审批人所在团队及角色(非下级)
              10 当前审批人所在团队的上级团队及角色(非下级) */}
          {/* type 6 */}
          <Radio style={radioStyle} checked={_.includes(teamAndRole, type)} value={teamAndRole}>
            指定审批人所在团队及角色
          </Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <SelectNumber
              value={_.includes(teamAndRole, type) ? type : 6}
              onChange={this.onTypeChange}
              disabled={!_.includes(teamAndRole, type)}
              style={{ width: '260px' }}
            >
              <Option key="6">特定团队</Option>
              <Option key="9">上一步骤处理人所在团队</Option>
              <Option key="10">上一步骤处理人所在团队的上级团队</Option>
              <Option key="901">流程发起人所在团队</Option>
              <Option key="101">流程发起人所在团队的上级团队</Option>
              <Option key="902">表单中用户所在团队</Option>
              <Option key="102">表单中用户所在团队的上级团队</Option>
              <Option key="106">表单中的团队</Option>
            </SelectNumber>
            {
              type === 6 &&
              <DepartmentSelect
                multiple
                value={type === 6 ? (data.deptid ? data.deptid.split(',') : []) : []}
                onChange={(values, labels) => {
                  this.onDataChange({ deptid: values.join(','), deptname: labels.join(',') });
                }}
                disabled={type !== 6}
                width="260px"
              />
            }
            {
              _.includes([902, 102, 106], type) &&
              <SelectField
                keys="entityid"
                style={{ width: 160 }}
                value={_.includes([902, 102, 106], type) ? data.entityid : undefined}
                placeholder="请选择表单"
                onChange={(entityid, fieldlabel) => this.onDataChange({ entityid, fieldlabel })}
                fields={formFields}
              />
            }
            {
              _.includes([106], type) &&
              <SelectField
                value={_.includes([106], type) ? data.fieldname : undefined}
                placeholder="请选择表单团队字段"
                onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
                fields={formTeamFields}
              />
            }
            {
              _.includes([902, 102], type) &&
              <SelectField
                placeholder="请选择表单用户字段"
                value={_.includes([902, 102], type) ? data.fieldname : undefined}
                onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
                fields={userFields}
              />
            }
            <SelectRole
              placeholder="请选择角色"
              value={_.includes(teamAndRole, type) ? data.roleid : ''}
              value_name={_.includes(teamAndRole, type) ? data.rolename : ''}
              onChange={(values) => {
                if (values) {
                  const labels = values.split(',').map(id => _.find(allRoles, ['id', id]).name);
                  this.onDataChange({
                    roleid: values,
                    rolename: labels.join(',')
                  });
                } else {
                  this.onDataChange({ roleid: '', rolename: '' });
                }
              }}
              isReadOnly={_.includes(teamAndRole, type) ? 0 : 1}
              allRoles={allRoles}
            />
          </div>

          {/* type 7 */}
          <Radio style={radioStyle} checked={_.includes(initator, type)} value={initator}>流程发起人</Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }} />

          {/* type 15 */}
          <Radio style={radioStyle} checked={_.includes(reportRelation, type)} value={reportRelation}>汇报关系</Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <SelectNumber
              value={(_.includes(reportRelation, type) && reportrelationdata) ? (reportrelationdata.type ? reportrelationdata.type + '' : '1') : '1'}
              onChange={(reportrelationtype) => {
                this.onDataChange({
                  reportrelation: { ...reportrelationdata, type: reportrelationtype },
                  fieldlabel: ['流程发起人', '上一步骤处理人', '表单中的人员'][reportrelationtype * 1 - 1]
                });
              }}
              disabled={!_.includes(reportRelation, type)}
              style={{ width: '260px' }}
            >
              {['流程发起人', '上一步骤处理人', '表单中的人员'].map((item, index) => <Option key={index} value={(index + 1) + ''}>{item}</Option>)}
            </SelectNumber>
            { // 表单中的人员
              _.includes(reportRelation, type) && (reportrelationdata && reportrelationdata.type * 1) === 3 &&
              <SelectField
                keys="entityid"
                style={{ width: 160 }}
                value={(_.includes(reportRelation, type) && reportrelationdata) ? data.entityid : undefined}
                placeholder="请选择表单"
                onChange={(entityid, fieldlabel) => this.onDataChange({ entityid, fieldlabel })}
                fields={formFields}
              />
            }
            { // 表单中的人员
              _.includes(reportRelation, type) && (reportrelationdata && reportrelationdata.type * 1) === 3 &&
              <SelectField
                placeholder="请选择表单用户字段"
                value={(_.includes([15], type) && reportrelationdata) ? data.fieldname : undefined}
                onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
                fields={userFields}
              />
            }
            {
              <SelectField
                keys="reportrelationid"
                disabled={!_.includes(reportRelation, type)}
                value={(_.includes(reportRelation, type) && reportrelationdata) ? reportrelationdata.id : undefined}
                placeholder="请选择汇报关系"
                onChange={(reportrelationid, fieldlabel) => this.onDataChange({ reportrelation: { ...reportrelationdata, id: reportrelationid }, fieldlabel })}
                fields={reportrelationList}
              />
            }
          </div>

          {/* 16 */}
          <Radio style={radioStyle} checked={_.includes(customs, type)} value={customs}>自定义审批人</Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
            <TextArea
              disabled={!_.includes(customs, type)}
              value={_.includes(customs, type) ? data.funcname : undefined}
              placeholder="输入需要执行的sql语句"
              onChange={this.onSelectChange.bind(this, 'funcname')}
            />
          </div>

        </Radio.Group>
      </div>
    );
  }
}

export default SelectFlowUser;
