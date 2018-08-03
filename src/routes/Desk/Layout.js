/**
 * Created by 0291 on 2018/8/1.
 */
import React from 'react';
import _ from 'lodash';
import RGL, { WidthProvider } from 'react-grid-layout';
import simpleHoc from './Hoc';

const ReactGridLayout = WidthProvider(RGL);

const test = [
  {"x":0,"y":0,"w":2,"h":2,"i":"0"},
  {"x":0,"y":2,"w":1,"h":1,"i":"1"},
  {"x":1,"y":2,"w":1,"h":2,"i":"2"},
  {"x":2,"y":4,"w":2,"h":1,"i":"3"}
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

  componentDidMount() {

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

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout);
  }

  onDragStart = (layout, oldItem, newItem, placeholder, e, element) => { //layout, oldItem, newItem, placeholder, e, element
    const translateValues = window.getComputedStyle(element).transform.split(',');
    let translateX = parseInt(translateValues[translateValues.length - 2]);
    console.log(translateX)
    this.setState({
      startX: translateX
    });
  }

  onDrag = (layout, oldItem, newItem, placeholder, e, element) => {
    //console.log(oldItem);
    const grid = document.getElementsByClassName('react-grid-layout')[0];
    const translateXMaxValue = grid.offsetWidth - element.offsetWidth;
    const translateYMaxValue = grid.offsetHeight - element.offsetHeight;
    const translateValues = window.getComputedStyle(element).transform.split(',');
    let translateX = parseInt(translateValues[translateValues.length - 2]);
    let translateY = parseInt(translateValues[translateValues.length - 1].slice(0, -1));

    if (translateX > translateXMaxValue) {
      translateX = translateXMaxValue;
    }
    if (translateX < 0) {
      translateX = 0;
    }
    if (translateY > translateYMaxValue) {
      translateY = translateYMaxValue;
    }
    if (translateY < 0) {
      translateY = 0;
    }


    if (oldItem.w === 2) { //宽度为2的  不允许往右移动
      element.style.transform = `translate(${10}px, ${translateY}px)`;
    } else {
      console.log(33333)
      element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

  }

  onDragStop = (layout, oldItem, newItem, placeholder, e, element) => {

  }

  render() {
    return (
      <ReactGridLayout
        {...this.props}
        layout={this.state.layout}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onDragStop={this.onDragStop}
        onLayoutChange={this.onLayoutChange}
        useCSSTransforms={true}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

export default simpleHoc(BasicLayout);
