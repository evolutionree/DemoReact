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
  {"x":0,"y":4,"w":2,"h":1,"i":"3"}
];

class BasicLayout extends React.PureComponent {
  static defaultProps = {
    className: 'layout',
    rowHeight: 60,
    onLayoutChange: function() {},
    cols: 2
  };

  constructor(props) {
    super(props);
    const layout = this.getLayout(props.layout);
    this.state = { layout };
  }

  componentWillReceiveProps(nextProps) {
    const layout = this.getLayout(nextProps.layout);
    this.setState({
      layout
    });
  }

  generateDOM() {
    return _.map(_.range(this.state.layout.length), (i) => {
      return (
        <div key={i}>
          <span className="text">
            <div className="text" style={{ minHight: this.state.layout[parseInt(i)].minH + 'px', maxHight: this.state.layout[parseInt(i)].maxH + 'px' }}>{i}</div>
          </span>
        </div>
      );
    });
  }

  onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout);
  }

  onDragStart = (layout, oldItem, newItem, placeholder, e, element) => { //layout, oldItem, newItem, placeholder, e, element

  }

  getLayout = (layout) => {
    const leftlayout = layout.map((item, index) => {
      return {"x":0,"y":0,"w":item.comwidth,"h":2,"i": index.toString(), minH: 2, maxH: 2.2 };
    });
console.log(leftlayout)
    return leftlayout;
  }

  onDrag = (layout, oldItem, newItem, placeholder, e, element) => {
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
    // if (translateY > translateYMaxValue) {
    //   translateY = translateYMaxValue;
    // }
    // if (translateY < 0) {
    //   translateY = 0;
    // }

    element.style.transform = `translate(${translateX}px, ${translateY}px)`;
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
