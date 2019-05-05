import React, { PropTypes, Component } from 'react';
import { Radio, Select } from 'antd';
import classnames from 'classnames';
import * as _ from 'lodash';
import { queryRoles } from '../../../../../services/role';
import SelectNumber from '../../../../../components/SelectNumber';
import SelectUser from '../../../../../components/DynamicForm/controls/SelectUser';
import DepartmentSelect from '../../../../../components/DepartmentSelect';
import styles from './styles.less';

const Option = Select.Option;

const SelectRole = ({ value, value_name, onChange, isReadOnly, allRoles }) => {
  let val = value ? value.split(',') : [];
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

const SelectField = ({ value, onChange, disabled, fields }) => {
  function onSelectChange(fieldname) {
    if (!fieldname) {
      return onChange();
    }
    const fieldlabel = _.find(fields, ['fieldname', fieldname]).displayname;
    onChange(fieldname, fieldlabel);
  }
  return (
    <Select
      value={value}
      onChange={onSelectChange}
      disabled={disabled}
      placeholder="请选择表单用户字段"
      style={{ width: '260px' }}
    >
      {fields.map(item => (
        <Option key={item.fieldname}>{item.displayname}</Option>
      ))}
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
    this.props.onChange({
      ...this.props.value,
      data: {
        ...this.props.value.data,
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
    let data = {};
    this.props.onChange({
      type,
      data
    });
  };

  onSelectChange = (e) => {
    console.log(e);
  }

  render() {
    const { entities, value: { type, data } } = this.props;

    const radioStyle = {
      display: 'block',
      marginRight: '700px'
    };

    let userFields = [];
    if (entities && entities[0]) {
      userFields = entities[0].fields.filter(field => [25, 1002, 1003, 1006].indexOf(field.controltype) !== -1);
    }

    return (
      <div className={styles.selectFlowUser}>
        <Radio.Group onChange={this.onRadioChange} style={{ width: '100%' }}>
          {/* type 1 */}
          <Radio style={radioStyle} checked={_.includes([1], type)} value={[1]}>让用户自己选择审批人</Radio>

          {/* type 2 */}
          <Radio style={radioStyle} checked={_.includes([2], type)} value={[2]}>
            指定审批人
          </Radio>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <SelectUser
              placeholder="请选择审批人"
              style={{ width: '260px', height: 'inherit' }}
              value={type === 2 ? data.userid : ''}
              value_name={type === 2 ? data.username : ''}
              onChange={() => { }}
              onChangeWithName={({ value, value_name }) => {
                this.onDataChange({ userid: value, username: value_name });
              }}
              isReadOnly={type === 2 ? 0 : 1}
              multiple={1}
            />
            <Select
              style={{ width: '135px' }}
              value={type === 2 ? data.leader : ''}
              onChange={this.onSelectChange}
              disabled={type !== 2}
              placeholder="请选择是否领导"
            >
              <Option value="">请选择是否领导</Option>
              <Option value="1">是</Option>
              <Option value="0">否</Option>
            </Select>
          </div>

          {/* type 4 */}
          <Radio style={radioStyle} checked={_.includes([4], type)} value={[4]}>
            指定审批人的角色
          </Radio>
          <SelectRole
            placeholder="请选择角色"
            value={type === 4 ? data.roleid : ''}
            value_name={type === 4 ? data.rolename : ''}
            onChange={(values) => {
              if (values) {
                const labels = values.split(',').map(id => _.find(this.state.allRoles, ['id', id]).name);
                this.onDataChange({
                  roleid: values,
                  rolename: labels.join(',')
                });
              } else {
                this.onDataChange({ roleid: '', rolename: '' });
              }
            }}
            isReadOnly={type === 4 ? 0 : 1}
            allRoles={this.state.allRoles}
          />

          {/*5 指定审批人所在团队(特定)*/}
          {/*8 当前审批人所在团队(非下级)*/}
          {/*11 当前审批人所在团队的上级团队(非下级)*/}
          {/* type 5 */}
          <Radio style={radioStyle} checked={_.includes([5, 8, 801, 802, 11, 111, 112], type)} value={[5, 8, 801, 802, 11, 111, 112]}>
            指定审批人所在团队
          </Radio>
          <SelectNumber
            value={_.includes([5, 8, 801, 802, 11, 111, 112], type) ? type : 5}
            onChange={this.onTypeChange}
            disabled={!_.includes([5, 8, 801, 802, 11, 111, 112], type)}
            style={{ width: '260px' }}
          >
            <Option key="5">特定团队</Option>
            <Option key="8">上一步骤处理人所在团队</Option>
            <Option key="11">上一步骤处理人所在团队的上级团队</Option>
            <Option key="801">流程发起人所在团队</Option>
            <Option key="111">流程发起人所在团队的上级团队</Option>
            <Option key="802">表单中用户所在团队</Option>
            <Option key="112">表单中用户所在团队的上级团队</Option>
          </SelectNumber>
          {type === 5 && <DepartmentSelect
            multiple
            value={type === 5 ? (data.deptid ? data.deptid.split(',') : []) : []}
            onChange={(values, labels) => {
              this.onDataChange({ deptid: values.join(','), deptname: labels.join(',') });
            }}
            disabled={type !== 5}
            width="260px"
          />}
          {(type === 802 || type === 112) && <SelectField
            value={(type === 802 || type === 112) ? data.fieldname : ''}
            onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
            fields={userFields}
          />}

          {/* 6 指定审批人所在团队及角色(特定)
              9 当前审批人所在团队及角色(非下级)
              10 当前审批人所在团队的上级团队及角色(非下级) */}
          {/* type 6 */}
          <Radio style={radioStyle} checked={_.includes([6, 9, 901, 902, 10, 101, 102], type)} value={[6, 9, 901, 902, 10, 101, 102]}>
            指定审批人所在团队及角色
          </Radio>
          <SelectNumber
            value={_.includes([6, 9, 901, 902, 10, 101, 102], type) ? type : 6}
            onChange={this.onTypeChange}
            disabled={!_.includes([6, 9, 901, 902, 10, 101, 102], type)}
            style={{ width: '260px' }}
          >
            <Option key="6">特定团队</Option>
            <Option key="9">上一步骤处理人所在团队</Option>
            <Option key="10">上一步骤处理人所在团队的上级团队</Option>
            <Option key="901">流程发起人所在团队</Option>
            <Option key="101">流程发起人所在团队的上级团队</Option>
            <Option key="902">表单中用户所在团队</Option>
            <Option key="102">表单中用户所在团队的上级团队</Option>
          </SelectNumber>
          {type === 6 && <DepartmentSelect
            multiple
            value={type === 6 ? (data.deptid ? data.deptid.split(',') : []) : []}
            onChange={(values, labels) => {
              this.onDataChange({ deptid: values.join(','), deptname: labels.join(',') });
            }}
            disabled={type !== 6}
            width="260px"
          />}
          {(type === 902 || type === 102) && <SelectField
            value={(type === 902 || type === 102) ? data.fieldname : ''}
            onChange={(fieldname, fieldlabel) => this.onDataChange({ fieldname, fieldlabel })}
            fields={userFields}
          />}
          <SelectRole
            placeholder="请选择角色"
            value={_.includes([6, 9, 901, 902, 10, 101, 102], type) ? data.roleid : ''}
            value_name={_.includes([6, 9, 901, 902, 10, 101, 102], type) ? data.rolename : ''}
            onChange={(values) => {
              if (values) {
                const labels = values.split(',').map(id => _.find(this.state.allRoles, ['id', id]).name);
                this.onDataChange({
                  roleid: values,
                  rolename: labels.join(',')
                });
              } else {
                this.onDataChange({ roleid: '', rolename: '' });
              }
            }}
            isReadOnly={_.includes([6, 9, 901, 902, 10, 101, 102], type) ? 0 : 1}
            allRoles={this.state.allRoles}
          />

          {/* type 7 */}
          <Radio style={radioStyle} checked={_.includes([7], type)} value={[7]}>流程发起人</Radio>
        </Radio.Group>
      </div>
    );
  }
}

export default SelectFlowUser;
