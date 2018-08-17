import React, { PropTypes } from 'react';
import { Link } from 'dva/router';
import { Icon, message, Select } from 'antd';
import classnames from 'classnames';
import DataSourceSelectModal from './DataSourceSelectModal';
import styles from './SelectUser.less';
import { checkHasPermission } from '../../../services/entcomm';
import { queryDataSourceData } from '../../../services/datasource';
import _ from 'lodash';

const Option = Select.Option;

class SelectDataSource extends React.Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // JSON格式, { id, name }
    // value_name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    dataSource: PropTypes.shape({
      sourceId: PropTypes.string,
      type: PropTypes.string
    }),
    designateDataSource: PropTypes.object,
    multiple: PropTypes.oneOf([0, 1]),
    isReadOnly: PropTypes.oneOf([0, 1]),
    placeholder: PropTypes.string
  };
  static defaultProps = {
    dataRange: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      options: [],
      refEntity: '',
      refEntityName: ''
    };
  }

  setValue = val => {
    if (!val || !Array.isArray(val)) {
      this.props.onChange('', true);
      return;
    }
    const name = val.map(item => item.name).join(',');
    const id = val.map(item => item.id).join(',');
    const _val = JSON.stringify({ name, id });
    this.props.onChange(_val, true);
  };

  handleOk = (arrIdName) => {
    this.hideModal();
    const id = arrIdName.map(obj => obj.id).join(',');
    const name = arrIdName.map(obj => obj.name).join(',');
    this.props.onChange(JSON.stringify({ id, name }));
  };

  showModal = () => {
    if (this.props.isReadOnly === 1) return;
    if (this.props.onFocus) {
      this.props.onFocus();
    }
    this.setState({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  parseValue = () => {
    const { value } = this.props;
    if (!value) return { text: '', array: [] };
    try {
      const { id, name } = typeof value === 'string' ? JSON.parse(value) : value;
      const arrIdName = [];
      if (id) {
        const arrId = id.split(',');
        const arrName = name.split(',');
        arrId.forEach((item, index) => {
          arrIdName.push({
            id: item,
            name: arrName[index]
          });
        });
      }
      return {
        text: name,
        array: arrIdName
      };
    } catch (e) {
      console.error(e);
      return { text: '', array: [] };
    }
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  selectChange = (options, value) => {
    const selectData = options instanceof Array && options.filter(item => value && value.indexOf(item.id) > -1);
    const id = selectData.map(obj => obj.id).join(',');
    const name = selectData.map(obj => obj.name).join(',');
    this.props.onChange(JSON.stringify({ id, name }));
  }

  queryOptions = (searchKey) => {
    this.setState({ loading: true });
    const params = {
      sourceId: this.props.dataSource && this.props.dataSource.sourceId,
      keyword: searchKey,
      pageSize: 10,
      pageIndex: 1,
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
      let options = result.data.page;
      const { text, array } = this.parseValue();
      options = _.uniqBy(_.concat(array, options), 'id');
      this.setState({ loading: false, options });
    }, err => {
      this.setState({ loading: false });
      console.error(err.message || '加载数据失败');
    });
  }

  render() {
    let { options } = this.state;
    const isReadOnly = this.props.isReadOnly === 1;
    const { text, array } = this.parseValue();
    options = _.uniqBy(_.concat(array, options), 'id');

    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: isReadOnly
    }]);

    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && text !== undefined && this.props.isReadOnly !== 1
    }]);

    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div className={styles.inputSelectWrap}>
          <Select onChange={this.selectChange.bind(this, options)}
                  onSearch={this.queryOptions}
                  placeholder={this.props.placeholder}
                  disabled={isReadOnly}
                  mode={this.props.multiple === 1 ? 'multiple' : null}
                  value={array.map(item => item.id)}
                  allowClear
          >
            {
              options instanceof Array && options.map(item => {
                return <Option key={item.id}>{item.name}</Option>;
              })
            }
          </Select>
          <div className={classnames(styles.openModal, { [styles.openModalDisabled]: isReadOnly })} onClick={this.showModal}>
            <Icon type="plus-square" />
          </div>
        </div>
        <DataSourceSelectModal
          visible={this.state.modalVisible}
          designateDataSource={this.props.designateDataSource}
          selected={array}
          allowadd={this.props.allowadd}
          sourceId={this.props.dataSource && this.props.dataSource.sourceId}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          multiple={this.props.multiple === 1}
        />
      </div>
    );
  }
}

SelectDataSource.View = ({ value, value_name, entityId }) => {
  if (!entityId) { // 没有entityid，以普通文本显示
    const emptyText = <span style={{ color: '#999999' }}>(空)</span>;
    const text = value_name !== undefined ? value_name : value;
    return <div>{text ? (text + '') : emptyText}</div>;
  }

  if (!value || !value_name) return null;
  const linkUrl = `/entcomm/${entityId}/${value.id}`;

  function redirect() {
    checkHasPermission({
      entityid: entityId,
      recid: value.id
    }).then(result => {
      if (result.data === '0') {
        message.error('您没有权限查看该数据');
      } else if (result.data === '2') {
        message.error('该数据已删除，无法查看');
      } else {
        window.open('#' + linkUrl);
      }
    }, err => {
      message.error('获取超时，请检查网络!');
    });
  }

  return (
    <div>
      <a href="javascript:;" onClick={redirect}>{value_name}</a>
      {/*<Link to={linkUrl} target="_blank">{value_name}</Link>*/}
    </div>
  );
};

export default SelectDataSource;
