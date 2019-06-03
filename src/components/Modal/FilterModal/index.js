import React, { PropTypes, Component } from 'react';
import { Modal, Select } from 'antd';
import FilterNode from './FilterNode';

const Option = Select.Option;

export default class FilterModal extends Component {
  static propTypes = {
    spacename: PropTypes.string,
    title: PropTypes.string,
    list: PropTypes.array,
    initParams: PropTypes.object,
    visible: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const columnFilter = props.initParams ? props.initParams.columnFilter : null;
    this.state = {
      selectValueList: [],
      columnFilter,
      loading: false
    };

    this.onhandleSelectChange = this.onhandleSelectChange.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.close = this.close.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { visible: newView } = nextProps;
    const { visible: oldView, initParams } = this.props;
    const columnFilter = initParams ? initParams.columnFilter : null;

    if (!oldView && newView) {
      const _list = columnFilter ? Object.keys(columnFilter).map(item => item) : [];
      if (_list.length) this.setState({ selectValueList: _list, columnFilter });
    }
  }

  handleOk = () => {
    const { spacename, dispatch, initParams, cancel } = this.props;
    const { columnFilter } = this.state;
    const params = { ...initParams, columnFilter };

    dispatch({ type: `${spacename}/Search`, payload: params });
    cancel();
  };

  onhandleSelectChange(list) {
    const { columnFilter } = this.state;
    const Obj = {};
    list.forEach(key => {
      if (columnFilter && Object.prototype.hasOwnProperty.call(columnFilter, key)) {
        Obj[key] = columnFilter[key];
      } else {
        Obj[key] = '';
      }
    });
    this.setState({ selectValueList: list, columnFilter: Obj });
  }

  close(value) {
    const { selectValueList, columnFilter } = this.state;
    const newColumnFilter = { ...columnFilter };
    delete newColumnFilter[value];
    this.setState({ selectValueList: selectValueList.filter(item => item !== value), columnFilter: newColumnFilter });
  }

  handleValue(e, fieldname) {
    const { columnFilter } = this.state;
    const value = e;
    const newColumnFilter = { ...columnFilter, [fieldname]: value };
    this.setState({ columnFilter: newColumnFilter });
  }

  render() {
    const { visible, confirmLoading, title = '过滤筛选', list, cancel, width } = this.props;
    const { selectValueList, columnFilter } = this.state;

    return (
      <Modal
        width={width || 500}
        title={title}
        visible={/^FilterModal$/.test(visible)}
        onOk={this.handleOk}
        onCancel={cancel}
        confirmLoading={confirmLoading}
        maskClosable
      >
        <div>
          <Select
            mode="tags"
            style={{ width: '100%', marginBottom: 10 }}
            onChange={this.onhandleSelectChange}
            tokenSeparators={[',']}
            allowClear
            value={selectValueList}
            placeholder="请选择筛选项"
          >
            {
              list.map((item, index) => <Option key={index} value={item.key}>{`${item.title}`}</Option>)
            }
          </Select>
          {
            Array.isArray(selectValueList) &&
            selectValueList.map((name, index) => {
              const record = list.find(item => item.key === name);
              const value = columnFilter[name] || '';
              return (record ? (
                <FilterNode
                  key={index}
                  value={value}
                  record={record}
                  onClose={this.close}
                  onHandleValue={this.handleValue}
                />
              ) : <div key={index}>无匹配字段，请检查数据源</div>);
            })
          }
        </div>
      </Modal>
    );
  }
}
