import React from 'react';
import { Modal, Col, Row, Icon, message, Button } from 'antd';
import _ from 'lodash';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import LabelList from '../../../components/ComplexForm/LabelList';
import { query as queryEntity } from '../../../services/entity';
import styles from './TransferData.less';

class EntitySelectModal extends React.Component {
  static propTypes = {
    value: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      id: React.PropTypes.number
    })),
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    multiple: React.PropTypes.bool,
    title: React.PropTypes.string,
    isRequiredSelect: React.PropTypes.bool //必须选择用户
  };
  static defaultProps = {
    value: [],
    multiple: true,
    title: '选择实体',
    isRequiredSelect: false
  };

  constructor(props) {
    super(props);
    this.state = {
      searchName: '',
      currentSelected: props.value || [],
      dataSource: [],
      modalVisible: false
    };
  }

  componentWillMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSelected: nextProps.value || []
    });
  }

  fetchList = () => {
    console.log(this.state.searchName)
    const params = {
      entityname: this.state.searchName,
      typeid: -1,
      pageindex: 1,
      pagesize: 9999,
      status: 1
    };
    queryEntity(params).then(result => {
      const dataSource = result.data.pagedata;
      this.setState({
        dataSource
      });
    });
  };

  onSearch = (keyword) => {
    this.setState({
      searchName: keyword
    }, this.fetchList);
  };

  selectAll = () => {
    const newSelected = this.state.dataSource.filter(dataItem => {
      return !this.state.currentSelected.some(item => item.entityid === dataItem.entityid);
    }).map(user => ({
      entityid: user.entityid,
      entityname: user.entityname || ''
    }));
    this.setState({
      currentSelected: [
        ...this.state.currentSelected,
        ...newSelected
      ]
    });
  };

  select = data => {
    const currSelected = this.state.currentSelected;
    const hasSelected = currSelected.some(item => item.entityid === data.entityid);
    if (!hasSelected) {
      this.setState({
        currentSelected: [
          ...currSelected,
          {
            entityid: data.entityid,
            entityname: data.entityname
          }
        ]
      });
    }
  };

  remove = data => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(item => item !== data)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  showModal = () => {
    this.fetchList();
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  handleRemove = (item) => {
    this.props.onChange(this.props.value.filter(i => i !== item));
  };

  handleOk = () => {
    this.props.onChange(this.state.currentSelected);
    this.hideModal();
  };

  renderValue = () => {
    const { placeholder } = this.props;
    let value = this.props.value || this.props.defaultValue;
    if (!value || !value.length) {
      return <div className={styles.placeholder}>{placeholder || ''}</div>;
    }
    return (
      <LabelList labels={value} onRemove={this.handleRemove} textKey="entityname" key="id" />
    );
  };

  render() {
    const { onCancel, multiple, title } = this.props;
    let { currentSelected, searchName, dataSource } = this.state;
    return (
      <div className={styles.fieldwrap}>
        {this.renderValue()}
        <Button onClick={this.showModal}>选择实体</Button>
        <Modal
          title={title}
          visible={this.state.modalVisible}
          onOk={this.handleOk}
          onCancel={onCancel}
          wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
        >
          <Toolbar>
            <Search
              width="200px"
              value={searchName}
              onSearch={this.onSearch}
              placeholder="请输入实体名称"
            >
              搜索
            </Search>
          </Toolbar>
          <Row gutter={20}>
            <Col span={11}>
              <ul className={styles.userlist}>
                {dataSource.map(user => (
                  <li key={user.entityid} onClick={this.select.bind(this, user)}>
                    <span title={user.username}>{user.entityid}</span>
                    <span title={user.deptname}>{user.entityname}</span>
                  </li>
                ))}
              </ul>
            </Col>
            <Col span={2}>
              <div style={{ height: '400px' }} className={styles.midcontrol}>
                <Icon type="right" onClick={this.selectAll} />
                <Icon type="left" onClick={this.removeAll} />
              </div>
            </Col>
            <Col span={11}>
              <ul className={styles.userlist}>
                {currentSelected.map(item => (
                  <li key={item.entityid}>
                    <span title={item.name}>{item.entityid}</span>
                    <span title={item.deptname}>{item.entityname || ''}</span>
                    <Icon type="close" onClick={this.remove.bind(this, item)} />
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}

export default EntitySelectModal;
