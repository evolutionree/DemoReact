import React, { PropTypes, Component } from 'react';
import { Icon, Dropdown, Menu } from 'antd';
import ImgIcon from './ImgIcon';

class ActionButton extends Component {
  static propTypes = {
    children: PropTypes.node,
    icon: PropTypes.string,
    actions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        label: PropTypes.node
      }))
    ]),
    onAction: PropTypes.func,
    renderOverlay: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      dropdownVisible: false
    };
  }

  handleMenuClick = event => {
    this.props.onAction(event.key);
    this.setState({ dropdownVisible: false });
  };

  handleButtonClick = () => {
    const { actions } = this.props;
    let actionKey;
    if (typeof actions === 'string') {
      actionKey = actions;
    } else {
      const defaultAction = actions.filter(item => item.isDefault)[0];
      if (defaultAction) actionKey = defaultAction.key;
    }
    actionKey && this.props.onAction(actionKey);
  };

  onVisibleChange = visible => {
    if (!visible) {
      this.setState({ dropdownVisible: false });
    }
  };

  showDropdown = () => {
    this.setState({ dropdownVisible: true });
  };

  render() {
    const { actions, children, icon, renderOverlay } = this.props;
    const isMultiple = typeof actions !== 'string';
    // const inner = (
    //   <div>
    //     <ImgIcon name={icon} style={{ marginRight: '4px' }} />
    //     <span onClick={this.handleButtonClick}>{children}</span>
    //     {isMultiple && (
    //       <Dropdown overlay={(
    //         <Menu onClick={this.handleMenuClick}>
    //           {actions.map(action => (
    //             <Menu.Item key={action.key}>{action.label}</Menu.Item>
    //           ))}
    //         </Menu>
    //       )}>
    //         <Icon type="caret-down" style={{ transform: 'scale(0.6)' }} />
    //       </Dropdown>
    //     )}
    //   </div>
    // );

    const wrapStyle = {
      display: 'inline-block',
      marginRight: '8px',
      padding: '5px',
      lineHeight: 1,
      cursor: 'pointer'
    };

    const overlay = renderOverlay && renderOverlay(() => { this.setState({ dropdownVisible: false }); });

    return (
      <div style={wrapStyle}>
        <Dropdown trigger={['click']} visible={this.state.dropdownVisible}
          onVisibleChange={this.onVisibleChange}
          overlay={overlay || (
            <Menu onClick={this.handleMenuClick}>
              {(isMultiple ? actions : []).map(action => (
                <Menu.Item key={action.key}>{action.label}</Menu.Item>
              ))}
            </Menu>
          )}
        >
          <div>
            <ImgIcon name={icon} style={{ marginRight: '4px' }} />
            <span onClick={this.handleButtonClick}>{children}</span>
            {!!(isMultiple || overlay) && <Icon type="caret-down" style={{ transform: 'scale(0.6)' }} onClick={this.showDropdown} />}
          </div>
        </Dropdown>
      </div>
    );

    // if (isMultiple) {
    //   const menu = (
    //     <Menu onClick={this.handleMenuClick}>
    //       {actions.map(action => (
    //         <Menu.Item key={action.key}>{action.label}</Menu.Item>
    //       ))}
    //     </Menu>
    //   );
    //   return (
    //     <div style={wrapStyle}>
    //       <Dropdown overlay={menu}>
    //         {inner}
    //       </Dropdown>
    //     </div>
    //   );
    // } else {
    //   return (
    //     <div style={wrapStyle}>
    //       {inner}
    //     </div>
    //   );
    // }
  }
}

export default ActionButton;
