import React from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Button, Menu, Modal } from 'antd';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import classnames from 'classnames';
// import Page from '../../../../components/Page';
import styles from './EntityButtons.less';
import EntityButtonForm from './EntityButtonForm';
import * as _ from 'lodash';

const DragHandle = SortableHandle(props => {
  return props.children;
});
const SortableMenuItem = SortableElement(props => {
  const { children, className, useDragHandle, key, index, ...rest } = props;
  return (
    <Menu.Item
      className={className}
      key={key}
      {...rest}
    >
      {children}
    </Menu.Item>
  );
});
const SortableMenu = SortableContainer(props => {
  const { className, children, ...rest } = props;
  return (
    <Menu className={className} {...rest}>
      {children}
    </Menu>
  );
});

function EntityButtons({
  buttons,
  selectedButton,
  createButton,
  selectButton,
  saveButton,
  delButton,
  reorderButtons,
  formValue,
  onEditingDataChange
}) {
  function handleSortEnd({ oldIndex, newIndex }) {
    const newOrderButtons = arrayMove(buttons, oldIndex, newIndex);
    reorderButtons(newOrderButtons);
  }
  function handleSelect(event) {
    selectButton(event.key);
  }
  function handleDel(id, event) {
    event.stopPropagation();
    delButton(id);
  }

  return (
    <div style={{ position: 'relative' }}>
      <Row gutter={10}>
        <Col span={6}>
          <div>
            <Button onClick={createButton} style={{ marginBottom: '10px' }}>添加按钮</Button>
            <SortableMenu
              className={styles.btnlist}
              onSortEnd={handleSortEnd}
              selectedKeys={[selectedButton]}
              onSelect={handleSelect}
              useDragHandle
            >
              {buttons && buttons instanceof Array && buttons.map((item, index) => {
                return (
                  <SortableMenuItem key={item.id} index={index} className={styles.btnitem}>
                    <DragHandle>
                      <Icon type="bars" style={{ cursor: 'move', marginRight: '5px' }} />
                    </DragHandle>
                    <span>{item.name}</span>
                    <Icon
                      onClick={handleDel.bind(null, item.id)}
                      type="close"
                      className={styles.closebtn}
                    />
                  </SortableMenuItem>
                );
              })}
            </SortableMenu>
          </div>
        </Col>
        <Col span={18}>
          <div style={{ maxWidth: '580px' }}>
            <EntityButtonForm
              value={formValue}
              onChange={onEditingDataChange}
              onSubmit={saveButton}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default connect(
  state => state.entityButtons,
  dispatch => {
    return {
      createButton() {
        dispatch({ type: 'entityButtons/createButton' });
      },
      onEditingDataChange(formValue) {
        dispatch({ type: 'entityButtons/putState', payload: { formValue } });
      },
      selectButton(id) {
        dispatch({ type: 'entityButtons/selectButton', payload: id });
      },
      saveButton(formData) {
        dispatch({ type: 'entityButtons/saveButton', payload: formData });
      },
      delButton(id) {
        Modal.confirm({
          title: '确定删除该按钮吗',
          onOk() {
            dispatch({ type: 'entityButtons/delButton', payload: id });
          }
        });
      },
      reorderButtons(newOrderButtons) {
        dispatch({ type: 'entityButtons/reorderButtons', payload: newOrderButtons });
      }
    };
  }
)(EntityButtons);
