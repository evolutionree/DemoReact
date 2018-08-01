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
    items: 5,
    rowHeight: 60,
    onLayoutChange: function() {},
    cols: 3,

  };

  constructor(props) {
    super(props);

    const layout = test; //this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (
        <div key={i}>
          <span className="text">{i}</span>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
      return {
        x: (i * 2) % 12,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        i: i.toString()
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
  }

  render() {
    console.log(JSON.stringify(this.state.layout))
    return (
      <ReactGridLayout
        layout={this.state.layout}
        onLayoutChange={this.onLayoutChange}
        {...this.props}
      >
        {this.generateDOM()}
      </ReactGridLayout>
    );
  }
}

export default simpleHoc(BasicLayout);
