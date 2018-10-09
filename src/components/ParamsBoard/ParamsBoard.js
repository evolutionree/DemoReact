import React from 'react';
import Toolbar from '../Toolbar';
import ParamsList from './ParamsList';
import NewParamForm from './NewParamForm';
import styles from './styles.less';

class ParamsBoard extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    fields: React.PropTypes.array.isRequired,
    itemKey: React.PropTypes.string,
    onOrderUp: React.PropTypes.func,
    onOrderDown: React.PropTypes.func,
    onSwitch: React.PropTypes.func,
    onCreate: React.PropTypes.func,
    onUpdate: React.PropTypes.func,
    onDel: React.PropTypes.func,
    toolbarNode: React.PropTypes.node,
    showEdit: React.PropTypes.func,
    showSwitch: React.PropTypes.func,
    showDel: React.PropTypes.func,
    showOrder: React.PropTypes.func,
    showAdd: React.PropTypes.bool,
    onClick: React.PropTypes.func //点击某个字段(支持点击链接的字段link:true)触发
  };
  static defaultProps = {
    showAdd: true
  };

  render() {
    return (
      <div className={styles.board}>
        <Toolbar style={{ overflow: 'visible' }}>
          <NewParamForm toolbarNode={this.props.toolbarNode} onSubmit={this.props.onCreate} fields={this.props.fields} showAdd={this.props.showAdd} />
        </Toolbar>
        <ParamsList {...this.props} />
      </div>
    );
  }

}

export default ParamsBoard;
