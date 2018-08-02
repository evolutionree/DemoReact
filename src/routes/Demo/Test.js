/**
 * Created by 0291 on 2018/8/1.
 */
import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import simpleHoc from './test-hook.jsx';

const ReactGridLayout = WidthProvider(RGL);

const test = [
  {"x":0,"y":0,"w":2,"h":2,"i":"0"},
  {"x":2,"y":0,"w":1,"h":1,"i":"1"},
  {"x":0,"y":2,"w":1,"h":2,"i":"2"},
  {"x":1,"y":2,"w":1,"h":3,"i":"3"},
  {"x":2,"y":1,"w":1,"h":2,"i":"4"}
];

class BasicLayout extends React.PureComponent {
  static defaultProps = {
    className: 'layout',
    rowHeight: 60,
    onLayoutChange: function() {},
    cols: 3

  };

  constructor(props) {
    super(props);

    const layout = test;
    this.state = { layout };
  }

  generateDOM() {
    return _.map(_.range(test.length), function(i) {
      return (
        <div key={i}>
          <span className="text">{i}</span>
        </div>
      );
    });
  }

  onLayoutChange(layout, layouts) {
    console.log(layout);
    console.log(layouts)
    this.props.onLayoutChange(layout);
  }

  onDragStart = (layout, oldItem, newItem, placeholder, e, element) => { //layout, oldItem, newItem, placeholder, e, element
    console.log(layout)
    console.log(oldItem);
    console.log(newItem);
    console.log(placeholder);
    console.log(e);
    console.log(element)
  }

  render() {
    return (
      <ReactGridLayout
        layout={this.state.layout}
        onDragStart={this.onDragStart}
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

export default simpleHoc(BasicLayout);
