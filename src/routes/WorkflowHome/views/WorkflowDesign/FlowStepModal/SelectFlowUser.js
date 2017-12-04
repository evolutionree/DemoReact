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
    <div className={styles.selectrole} style={{ width: '240px' }} title={value_name}>
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

  render() {
    const { type, data } = this.props.value;
    console.log(data);
    const radioStyle = {
      display: 'block'
    };
    return (
      <div>
        <Radio.Group onChange={this.onRadioChange}>
          <Radio style={radioStyle} checked={_.includes([1], type)} value={[1]}>让用户自己选择审批人</Radio>
          <Radio style={radioStyle} checked={_.includes([2], type)} value={[2]}>
            指定审批人
          </Radio>
          <SelectUser
            placeholder="请选择审批人"
            value={type === 2 ? data.userid : ''}
            value_name={type === 2 ? data.username : ''}
            onChange={() => {}}
            onChangeWithName={({ value, value_name }) => {
              this.onDataChange({ userid: value, username: value_name });
            }}
            isReadOnly={type === 2 ? 0 : 1}
            multiple={1}
          />
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
          {/* 5	指定审批人所在团队(特定)
              8	当前审批人所在团队(非下级)
              11	当前审批人所在团队的上级团队(非下级)	 */}
          <Radio style={radioStyle} checked={_.includes([5, 8, 11], type)} value={[5, 8, 11]}>
            指定审批人所在团队
          </Radio>
          <SelectNumber
            value={_.includes([5, 8, 11], type) ? type : 5}
            onChange={this.onTypeChange}
            disabled={!_.includes([5, 8, 11], type)}
            style={{ width: '240px' }}
          >
            <Option key="5">指定审批人所在团队(特定)</Option>
            <Option key="8">上一步处理人所在团队</Option>
            <Option key="11">当前审批人所在团队的上级团队(非下级)</Option>
          </SelectNumber>
          <DepartmentSelect
            multiple
            value={type === 5 ? (data.deptid ? data.deptid.split(',') : []) : []}
            onChange={(values, labels) => {
              this.onDataChange({ deptid: values.join(','), deptname: labels.join(',') });
            }}
            disabled={type !== 5}
            width="300px"
          />
          {/* 6	指定审批人所在团队及角色(特定)
              9	当前审批人所在团队及角色(非下级)
              10	当前审批人所在团队的上级团队及角色(非下级)	 */}
          <Radio style={radioStyle} checked={_.includes([6, 9, 10], type)} value={[6, 9, 10]}>
            指定审批人所在团队及角色
          </Radio>
          <SelectNumber
            value={_.includes([6, 9, 10], type) ? type : 6}
            onChange={this.onTypeChange}
            disabled={!_.includes([6, 9, 10], type)}
            style={{ width: '240px' }}
          >
            <Option key="6">指定审批人所在团队(特定)</Option>
            <Option key="9">当前审批人所在团队(非下级)</Option>
            <Option key="10">当前审批人所在团队的上级团队(非下级)</Option>
          </SelectNumber>
          <DepartmentSelect
            multiple
            value={type === 6 ? (data.deptid ? data.deptid.split(',') : []) : []}
            onChange={(values, labels) => {
              this.onDataChange({ deptid: values.join(','), deptname: labels.join(',') });
            }}
            disabled={type !== 6}
            width="300px"
          />
          <SelectRole
            placeholder="请选择角色"
            value={_.includes([6, 9, 10], type) ? data.roleid : ''}
            value_name={_.includes([6, 9, 10], type) ? data.rolename : ''}
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
            isReadOnly={_.includes([6, 9, 10], type) ? 0 : 1}
            allRoles={this.state.allRoles}
          />
          <Radio style={radioStyle} checked={_.includes([7], type)} value={[7]}>流程发起人</Radio>
        </Radio.Group>
      </div>
    );
  }
}

export default SelectFlowUser;
