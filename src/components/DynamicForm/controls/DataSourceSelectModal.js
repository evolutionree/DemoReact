import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { Modal, Col, Row, Icon, message, Spin, Pagination } from 'antd';
import classnames from 'classnames';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import DepartmentSelect from '../../../components/DepartmentSelect';
import { parseConfigData } from '../../../components/ListStylePicker';
import { queryDataSourceData } from '../../../services/datasource';
import styles from './SelectData.less';
import Avatar from "../../Avatar";

class DataSourceSelectModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    sourceId: PropTypes.string,
    selected: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })),
    designateDataSource: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiple: PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selected: [],
    multiple: true
  };

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      currentSelected: [...props.selected],
      list: [],
      pageIndex: 1,
      total: 0,
      config: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        keyword: '',
        currentSelected: [...nextProps.selected],
        list: [],
        pageIndex: 1,
        total: 0
      }, this.fetchList);
    }
  }

  fetchList = () => {
    this.setState({ loading: true });
    const params = {
      sourceId: this.props.sourceId,
      keyword: this.state.keyword,
      pageSize: 10,
      pageIndex: this.state.pageIndex,
      queryData: []
    };
    const { designateDataSource } = this.props;
    if (designateDataSource && typeof designateDataSource === 'object') {
      Object.keys(designateDataSource).forEach(key => {
        params.queryData.push({
          [key]: designateDataSource[key],
          islike: 0
        });
      });
    }
    queryDataSourceData(params).then(result => {
      if (result.data.dsconfig) {
        this.setState({ config: result.data.dsconfig[0] });
      }
      const list = result.data.page;
      const total = result.data.pagecount[0].total;
      this.setState({ loading: false, list, total });

      if (!this.props.multiple && this.state.currentSelected.length) {
        if (list.every(item => item.id !== this.state.currentSelected[0].id)) {
          this.setState({ currentSelected: [] });
        }
      }
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '加载数据失败');
    });
  };

  handleOk = () => {
    const selected = this.state.currentSelected.map(
      item => ({ id: item.id, name: item.name })
    );
    if (selected.length === 0) {
      message.error('请先选择数据');
      return false;
    }
    this.props.onOk(selected);
  };

  onSearch = keyword => {
    this.setState({ keyword, pageIndex: 1 }, this.fetchList);
  };

  onPageChange = pageIndex => {
    this.setState({ pageIndex }, this.fetchList);
  };

  selectAll = () => {
    this.setState({
      currentSelected: _.unionBy(this.state.currentSelected, this.state.list, i => i.id)
    });
  };

  select = item => {
    this.setState({
      currentSelected: _.unionBy(this.state.currentSelected, [item], i => i.id)
    });
  };

  selectSingle = item => {
    this.setState({ currentSelected: [item] });
  };

  doubleSelectSingle = item => {
    const selected = [item].map(
      item => ({ id: item.id, name: item.name })
    );
    this.props.onOk(selected);
  }

  remove = item => {
    this.setState({
      currentSelected: this.state.currentSelected.filter(i => i !== item)
    });
  };

  removeAll = () => {
    this.setState({ currentSelected: [] });
  };

  renderItem = (item) => {
    const { iconField, listFields } = parseConfigData(this.state.config);
    // const { fieldkeys } = this.state.config;
    // const keys = fieldkeys.split(',');
    return (
      <div className={classnames([styles.listrow, { [styles.hasIcon]: !!iconField }])}>
        {iconField && (
          <Avatar
            className={styles.listIcon}
            style={{ width: '28px', height: '28px' }}
            image={`/api/fileservice/read?fileid=${item[iconField.fieldName]}&filetype=3`}
          />
        )}
        <Row gutter={10}>
          {/*{keys.map(key => (*/}
            {/*<Col span={12} key={key}><span title={item[key]}>{item[key]}</span></Col>*/}
          {/*))}*/}
          {listFields.map(({ fieldName, color, font }) => {
            const text = item[fieldName + '_name'] !== undefined ? item[fieldName + '_name'] : item[fieldName];
            return (
              <Col span={12} key={fieldName}>
                <span
                  title={text}
                  style={{ color, fontSize: font + 'px' }}
                >
                  {text}
                </span>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected } = this.state;
    const pagination = (
      <Pagination
        size="small"
        current={this.state.pageIndex}
        total={this.state.total}
        showSizeChanger={false}
        showQuickJumper={false}
        onChange={this.onPageChange}
      />
    );
    return (
      <Modal
        title="请选择"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName={multiple ? 'ant-modal-custom-large' : ''}
      >
        <Toolbar>
          <Search
            width="200px"
            value={this.state.keyword}
            onSearch={this.onSearch}
            placeholder="请输入关键字"
          >
            搜索
          </Search>
        </Toolbar>
        <Spin spinning={this.state.loading}>
          {multiple ? (
            <Row gutter={20}>
              <Col span={11}>
                <ul className={styles.dataList}>
                  {this.state.list.map(item => (
                    <li key={item.id} onClick={this.select.bind(this, item)}>
                      {this.renderItem(item)}
                    </li>
                  ))}
                </ul>
                {pagination}
              </Col>
              <Col span={2}>
                <div style={{ height: '400px' }} className={styles.midcontrol}>
                  <Icon type="right" onClick={this.selectAll} />
                  <Icon type="left" onClick={this.removeAll} />
                </div>
              </Col>
              <Col span={11}>
                <ul className={styles.dataList}>
                  {currentSelected.map(item => (
                    <li key={item.id}>
                      <div className={styles.listrow}>
                        <Row>
                          <Col><span>{item.name}</span></Col>
                        </Row>
                      </div>
                      <Icon type="close" onClick={this.remove.bind(this, item)} />
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
          ) : (
            <div>
              <ul className={styles.dataList}>
                {this.state.list.map(item => {
                  const cls = (currentSelected.length && currentSelected[0].id === item.id) ? styles.highlight : '';
                  return (
                    <li key={item.id} onClick={this.selectSingle.bind(this, item)} onDoubleClick={this.doubleSelectSingle.bind(this, item)} className={cls}>
                      {this.renderItem(item)}
                    </li>
                  );
                })}
              </ul>
              {pagination}
            </div>
          )}
        </Spin>
      </Modal>
    );
  }
}

export default DataSourceSelectModal;
