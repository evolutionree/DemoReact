/**
 * Created by 0291 on 2018/5/18.
 */
import React from 'react';
import { Select, Modal, Table } from 'antd';
import { querywithdatasource } from '../../../../services/entity';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './RelBusDataSource.less';

const Option = Select.Option;

class RelBusDataSource extends React.PureComponent {
  static propTypes = {
    value: React.PropTypes.shape({
      type: React.PropTypes.oneOf(['free']),
      config: React.PropTypes.array
    }),
    onChange: React.PropTypes.func
  };

  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      currItems: [],
      dataSource: []
    };
  }

  componentWillMount() {
    this.fetchOptions(this.props.value);
  }

  componentWillReceiveProps(nextprops) {
    if (!_.isEqual(nextprops.value, this.props.value)) {
      this.fetchOptions(nextprops.value);
    }
  }

  fetchOptions = (formItemValue) => {
    let config = [];
    if (formItemValue) {
      config = formItemValue.config;
    }


    let currItems = [];
    querywithdatasource().then(result => {
      let resultData = result.data;
      for (let i = 0; i < resultData.length; i ++) { //将表单数据 与 弹出层表格初始化数据  融合
        resultData[i].selectDatasourceId = resultData[i].datasources[0].datasourceid;
        resultData[i].selectDatasourceName = resultData[i].datasources[0].datasourcename;
        for (let j = 0; j < config.length; j++) {
          if (resultData[i].entityid === config[j].entityid) {
            resultData[i].selectDatasourceId = config[j].datasourceid;
            resultData[i].selectDatasourceName = config[j].datasourcename;

            currItems.push(resultData[i].entityid);
          }
        }
      }
      this.setState({
        dataSource: resultData,
        currItems
      });
    });
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  onSelectDataSource = (index, datasourceArray, value) => {
    let newDataSource = _.cloneDeep(this.state.dataSource);
    let currentSelectDataSourceObj = _.find(datasourceArray, item => item.datasourceid === value);
    newDataSource[index].selectDatasourceId = value;
    newDataSource[index].selectDatasourceName = currentSelectDataSourceObj.datasourcename;
    this.setState({
      dataSource: newDataSource
    });
  }

  handleChange = () => {
    const { currItems } = this.state;
    let newFormItemValue = [];
    this.state.dataSource.map(item => {
      if (currItems.indexOf(item.entityid) > -1) {
        newFormItemValue.push({
          entityid: item.entityid,
          entityname: item.entityname,
          datasourceid: item.selectDatasourceId,
          datasourcename: item.selectDatasourceName
        });
      }
    })
    this.props.onChange && this.props.onChange({
      type: 'free',
      config: newFormItemValue
    });
    this.setState({
      modalVisible: false
    });
  };

  onCancel = () => {
    this.setState({
      modalVisible: false
    });
  }


  parseValue = () => {
    let config = [];
    if (this.props.value) {
      config = this.props.value.config;
    }

    let text = [];
    text = config.map(item => {
      return item.entityname + '-' + item.datasourcename;
    });
    return text.join(',');
  };

  render() {
    const text = this.parseValue();
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: this.props.isReadOnly === 1
    }]);

    const columns = [{
      title: '实体',
      dataIndex: 'entityname'
    }, {
      title: '数据源',
      dataIndex: 'datasources',
      width: 260,
      render: (text, record, index) => {
        return (
          <Select style={{ width: '100%' }} onChange={this.onSelectDataSource.bind(this, index, text)} value={record.selectDatasourceId}>
            {
              text.map((item, itemIndex) => {
                return <Option value={item.datasourceid} key={item.datasourceid}>{item.datasourcename}</Option>;
              })
            }
          </Select>
        );
      }
    }];

    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div className="ant-input" onClick={this.showModal} title={text}>
          {
            text || this.props.placeholder
          }
        </div>
        <Modal
          title="选择数据源"
          visible={this.state.modalVisible}
          onOk={this.handleChange}
          onCancel={this.onCancel}
          wrapClassName="selectDatasourceWrap"
        >
          <Table rowSelection={{
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                currItems: selectedRowKeys
              });
            },
            selectedRowKeys: this.state.currItems
          }} columns={columns} dataSource={this.state.dataSource} pagination={false} rowKey="entityid" />
        </Modal>
      </div>
    );
  }
}

export default RelBusDataSource;
