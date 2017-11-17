import React from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

const SortableItem = SortableElement(props => <li>{props.name}</li>);
const SortableList = SortableContainer(props => {
  const items = props.items;
  return (
    <ul>
      {items.map((item, index) => (
        <SortableItem key={item.id} index={index} name={item.name} />
      ))}
    </ul>
  );
});
