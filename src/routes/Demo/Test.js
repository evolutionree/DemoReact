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
    console.log(e);
  }

  onDrag = (layout, oldItem, newItem, placeholder, e, element) => {
    //console.log(e);
    if (e.clientX > 1184) {
      console.log('chaochu ');
      element.style.left = `${1184 - element.offsetWidth}px`;
      return false;
    }

    // const grid = document.getElementsByClassName('react-grid-layout')[0];
    // const translateXMaxValue = grid.offsetWidth - element.offsetWidth;
    // const translateYMaxValue = grid.offsetHeight - element.offsetHeight;
    //
    // const translateValues = window.getComputedStyle(element).transform.split(',');
    // let translateX = parseInt(translateValues[translateValues.length - 2]);
    // let translateY = parseInt(translateValues[translateValues.length - 1].slice(0, -1));
    //
    // if (translateX > translateXMaxValue) {
    //   translateX = translateXMaxValue;
    // }
    // if (translateX < 0) {
    //   translateX = 0;
    // }
    // if (translateY > translateYMaxValue) {
    //   translateY = translateYMaxValue;
    // }
    // if (translateY < 0) {
    //   translateY = 0;
    // }
    //
    // element.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }

  onDragStop = (layout, oldItem, newItem, placeholder, e, element) => {
    console.log(layout);
    console.log(oldItem);
    console.log(newItem);
    this.setState({
      layout: test
    })
  }

  render() {
    return (
      <ReactGridLayout
        layout={this.state.layout}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onDragStop={this.onDragStop}
        onLayoutChange={this.onLayoutChange}
        useCSSTransforms={false}
        {...this.props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

export default simpleHoc(BasicLayout);
