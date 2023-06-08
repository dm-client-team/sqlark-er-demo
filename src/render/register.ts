import { NodeData } from '@/mock/model-test';
import G6, { G6Event, G6GraphEvent, Graph, IBBox, IG6GraphEvent, IGroup, IPoint, Util } from '@antv/g6';
import { ext } from '@antv/matrix-util';
const { clone } = Util
const { transform } = ext;
const DELTA = 0.05;
const itemCount = 10

type Size = { width: number, height: number }

const style = {
  themeColor: '#F4664A',
  textColor: '#666',
  width: 300,
  headerHeight: 48,
  fieldHeight: 32,
  fieldFontSize: 14,
  background: '#fff',
  radius: 6
}
const height = (node: NodeData) => style.headerHeight + style.fieldHeight * (node.fields.length > itemCount ? itemCount : node.fields.length)
const xy = (top: number, left: number, containerSize: Size) => ({
  x: left - (containerSize.width / 2),
  y: top - (containerSize.height / 2)
})
const fieldTop = (index: number) => {
  return style.headerHeight + index * style.fieldHeight + (style.fieldHeight - style.fieldFontSize) / 2
}
export const size = ({ fields }: { fields: any[] }) => [style.width + 2, style.headerHeight + style.fieldHeight * (fields.length > itemCount ? itemCount : fields.length) + 2]
const render = (cfg: NodeData, group: IGroup) => {

  const size: Size = { height: height(cfg), width: style.width }
  const { radius, headerHeight, width, themeColor, fieldFontSize, textColor, fieldHeight } = style

  const headerSize = { height: headerHeight, width }

  group.addShape('rect', {
    attrs: {
      ...xy(0, 0, size),
      ...headerSize,
      fill: themeColor,
      radius: [radius, radius, 0, 0],
    },
    name: 'title-box',
    draggable: true,
  });
  group.addShape('image', {
    attrs: {
      ...xy(8, 8, size),
      height: 32,
      width: 32,
      cursor: 'pointer',
      img: 'https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*0HC-SawWYUoAAAAAAAAAAABkARQnAQ',
    },
    name: 'node-icon',
  });
  group.addShape('text', {
    attrs: {
      ...xy(15, 48, size),
      textBaseline: 'top',
      fontSize: 18,
      text: cfg.label,
      fill: '#fff',
    },
    name: 'title-text',
  });

  if (cfg.fields.length <= itemCount) {

    cfg.fields.forEach((field, index) => {

      // title text
      group.addShape('text', {
        attrs: {
          textBaseline: 'top',
          ...xy(fieldTop(index), 12, size),
          fontSize: fieldFontSize,
          text: field.label,
          fill: field.typeMeta ? themeColor : textColor,
        }, name: 'field-name-' + index,
      });

      // title text
      group.addShape('text', {
        attrs: {
          textBaseline: 'top',
          ...xy(fieldTop(index), width - 12, size),
          fontSize: fieldFontSize,
          text: field.type,
          fill: field.typeMeta ? themeColor : textColor,
          textAlign: 'right'
        },
        name: 'field-type-' + index,
      });

    })

    return
  }

  // 绘制字段信息

  const listContainer = group.addGroup({})

  const listSize = { width, height: itemCount * fieldHeight }
  listContainer.setClip({
    type: "rect",
    attrs: {
      ...xy(headerHeight, 0, size),
      ...listSize
    }
  })

  // 绘制滚动条
  const barStyle = {
    width: 4,
    padding: 0,
    boxStyle: {
      stroke: "#00000022",
    },
    innerStyle: {
      fill: "#00000022",
    },
  };

  listContainer.addShape("rect", {
    attrs: {
      ...xy(headerHeight, width - barStyle.width, size),
      width: barStyle.width,
      height: listSize.height,
      ...barStyle.boxStyle,
    },
  });

  const scrollBarHeight = itemCount / cfg.fields.length * listSize.height
  const hideCount = cfg.fields.length - itemCount
  const scrollBarTop = (cfg.startIndex / hideCount) * (listSize.height - scrollBarHeight)
  listContainer.addShape("rect", {
    attrs: {
      ...xy(headerHeight + scrollBarTop, width - barStyle.width, size),
      width: barStyle.width,
      height: scrollBarHeight,
      ...barStyle.innerStyle,
    }
  })

  cfg.fields.forEach((field, index) => {

    // title text
    listContainer.addShape('text', {
      attrs: {
        textBaseline: 'top',
        ...xy(fieldTop(index - cfg.startIndex), 12, size),
        fontSize: fieldFontSize,
        text: field.label,
        fill: field.typeMeta ? themeColor : textColor,
      }, name: 'field-name-' + index,
    });

    // title text
    listContainer.addShape('text', {
      attrs: {
        textBaseline: 'top',
        ...xy(fieldTop(index - cfg.startIndex), width - 12, size),
        fontSize: fieldFontSize,
        text: field.type,
        fill: field.typeMeta ? themeColor : textColor,
        textAlign: 'right'
      },
      name: 'field-type-' + index,
    });

  })

}
const roundAnchor = (size = 1) => {
  const arr = new Array(size).fill(0).map((_, i) => {
    return (i + 1) * 1 / size
  })

  const left = arr.map(i => [0, i])
  const bottom = arr.map(i => [i, 1])
  const right = arr.map(i => [1, 1 - i])
  const top = arr.map(i => [1 - i, 0])

  return [...left, ...bottom, ...right, ...top]
}


const isInBBox = (point: IPoint, bbox: IBBox) => {
  const {
    x,
    y
  } = point;
  const {
    minX,
    minY,
    maxX,
    maxY
  } = bbox;

  return x < maxX && x > minX && y > minY && y < maxY;
};

G6.registerBehavior('dice-er-scroll', {
  getDefaultCfg() {
    return {
      multiple: true,
    };
  },
  getEvents() {
    return {
      // itemHeight: 50,
      'wheel': "scorll",
      // click: "click",
      // "node:mousemove": "move",
    } as any;
  },
  scorll(e: G6GraphEvent) {

    e.preventDefault();
    const graph: Graph = (this as any).graph
    const nodes = graph.getNodes().filter((n) => {
      const bbox = n.getBBox();
      return isInBBox(graph.getPointByClient(e.clientX, e.clientY), bbox);
    });
    if (nodes) {
      nodes.forEach((node) => {
        const model: NodeData = node.getModel() as any;
        if (model.fields.length <= itemCount) {
          return;
        }
        const idx = model.startIndex || 0;
        let startIndex = idx + (e as any).deltaY * 0.01;
        if (startIndex < 0) {
          startIndex = 0;
        }
        if (startIndex > (model.fields.length - itemCount)) {
          startIndex = model.fields.length - itemCount
        }

        console.log(startIndex)
        graph.update(node, { startIndex });

        graph.getEdges()
          .filter(edge => {
            const cfg = edge.getModel()

            if (cfg.source === model.originalKey) return true
            if (cfg.target === model.originalKey) return true

            return false
          }).forEach(edge => {
            edge.refresh()
          })
      });
    }

  }
}
)

G6.registerBehavior("zoom-canvas-outside-node", {
  getDefaultCfg(): object {
    return {
      sensitivity: 2,
      minZoom: undefined,
      maxZoom: undefined,
      enableOptimize: false,
      optimizeZoom: 0.1,
      fixSelectedItems: {
        fixAll: false,
        fixLineWidth: false,
        fixLabel: false,
        fixState: 'selected',
      },
      animate: false,
      animateCfg: {
        duration: 500,
      },
    };
  },
  getEvents(): { [key in G6Event]?: string } {
    const { fixSelectedItems } = this as any;

    if (!fixSelectedItems.fixState) fixSelectedItems.fixState = 'selected';
    if (fixSelectedItems.fixAll) {
      fixSelectedItems.fixLineWidth = true;
      fixSelectedItems.fixLabel = true;
    }
    return {
      wheel: 'onWheel',
    };
  },
  onWheel(e: IG6GraphEvent) {
    const _this = this as any
    const { graph, fixSelectedItems } = _this;

    const nodes = graph.getNodes().filter((n: any) => {
      const bbox = n.getBBox();
      return isInBBox(graph.getPointByClient(e.clientX, e.clientY), bbox);
    });

    if (nodes.length) return

    if (_this.shouldBegin && !_this.shouldBegin(e, _this)) {
      return;
    }

    if (!_this.shouldUpdate(e, _this)) {
      return;
    }
    e.preventDefault();
    const canvas = graph.get('canvas');
    const point = canvas.getPointByClient(e.clientX, e.clientY);
    const sensitivity = _this.get('sensitivity');
    const graphZoom = graph.getZoom();
    let ratio = graphZoom;
    let zoom = graphZoom;
    // 兼容IE、Firefox及Chrome
    if (e.wheelDelta < 0) {
      ratio = 1 - DELTA * sensitivity;
    } else {
      ratio = 1 / (1 - DELTA * sensitivity);
    }
    zoom = graphZoom * ratio;
    const minZoom = _this.get('minZoom') || graph.get('minZoom');
    const maxZoom = _this.get('maxZoom') || graph.get('maxZoom');
    if (zoom > maxZoom) {
      zoom = maxZoom;
    } else if (zoom < minZoom) {
      zoom = minZoom;
    }

    // hide the shapes when the zoom ratio is smaller than optimizeZoom
    // hide the shapes when zoomming
    const enableOptimize = _this.get('enableOptimize');
    if (enableOptimize) {
      const optimizeZoom = _this.get('optimizeZoom');
      const optimized = _this.get('optimized');
      const nodes = graph.getNodes();
      const edges = graph.getEdges();
      const nodesLength = nodes.length;
      const edgesLength = edges.length;

      // hiding
      if (!optimized) {
        for (let n = 0; n < nodesLength; n++) {
          const node = nodes[n];
          if (!node.destroyed) {
            const children = node.get('group').get('children');
            const childrenLength = children.length;
            for (let c = 0; c < childrenLength; c++) {
              const shape = children[c];
              if (!shape.destoryed && !shape.get('isKeyShape')) {
                shape.set('ori-visibility', shape.get('ori-visibility') || shape.get('visible'));
                shape.hide();
              }
            }
          }
        }

        for (let edgeIndex = 0; edgeIndex < edgesLength; edgeIndex++) {
          const edge = edges[edgeIndex];
          const children = edge.get('group').get('children');
          const childrenLength = children.length;
          for (let c = 0; c < childrenLength; c++) {
            const shape = children[c];
            shape.set('ori-visibility', shape.get('ori-visibility') || shape.get('visible'));
            shape.hide();
          }
        }
        _this.set('optimized', true);
      }

      // showing after 100ms
      clearTimeout(_this.get('timeout'));
      const timeout = setTimeout(() => {
        const currentZoom = graph.getZoom();
        const curOptimized = _this.get('optimized');
        if (curOptimized) {
          _this.set('optimized', false);
          for (let n = 0; n < nodesLength; n++) {
            const node = nodes[n];
            const children = node.get('group').get('children');
            const childrenLength = children.length;
            if (currentZoom < optimizeZoom) {
              const keyShape = node.getKeyShape();
              const oriVis = keyShape.get('ori-visibility');
              keyShape.set('ori-visibility', undefined);
              if (oriVis) keyShape.show();
            } else {
              for (let c = 0; c < childrenLength; c++) {
                const shape = children[c];
                const oriVis = shape.get('ori-visibility');
                shape.set('ori-visibility', undefined);
                if (!shape.get('visible') && oriVis) {
                  if (oriVis) shape.show();
                }
              }
            }
          }

          for (let edgeIndex = 0; edgeIndex < edgesLength; edgeIndex++) {
            const edge = edges[edgeIndex];
            const children = edge.get('group').get('children');
            const childrenLength = children.length;
            if (currentZoom < optimizeZoom) {
              const keyShape = edge.getKeyShape();
              const oriVis = keyShape.get('ori-visibility');
              keyShape.set('ori-visibility', undefined);
              if (oriVis) keyShape.show();
            } else {
              for (let c = 0; c < childrenLength; c++) {
                const shape = children[c];
                if (!shape.get('visible')) {
                  const oriVis = shape.get('ori-visibility');
                  shape.set('ori-visibility', undefined);
                  if (oriVis) shape.show();
                }
              }
            }
          }
        }
      }, 100);
      _this.set('timeout', timeout);
    }

    // fix the items when zooming
    if (graphZoom <= 1) {
      let fixNodes, fixEdges;
      if (fixSelectedItems.fixAll || fixSelectedItems.fixLineWidth || fixSelectedItems.fixLabel) {
        fixNodes = graph.findAllByState('node', fixSelectedItems.fixState);
        fixEdges = graph.findAllByState('edge', fixSelectedItems.fixState);

        const scale = graphZoom / zoom;
        const fixNodesLength = fixNodes.length;
        for (let fn = 0; fn < fixNodesLength; fn++) {
          const node = fixNodes[fn];
          const group = node.getContainer();
          const nodeModel = node.getModel();
          const originStyle = node.getOriginStyle();
          const itemStateStyle = node.getStateStyle(fixSelectedItems.fixState);
          const shapeStateStyle = node
            .get('shapeFactory')
            .getShape(nodeModel.type)
            .getStateStyle(fixSelectedItems.fixState, node)[fixSelectedItems.fixState];
          if (fixSelectedItems.fixAll) {
            if (zoom <= 1) {
              let groupMatrix = clone(group.getMatrix());
              if (!groupMatrix) groupMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
              const { x, y } = node.getModel();
              groupMatrix = transform(groupMatrix, [
                ['t', -x, -y],
                ['s', scale, scale],
                ['t', x, y],
              ]);
              group.setMatrix(groupMatrix);
            }
          } else {
            const children = group.get('children');
            const childrenLength = children.length;
            for (let c = 0; c < childrenLength; c++) {
              const shape = children[c];
              let fontSize, lineWidth;
              if (fixSelectedItems.fixLabel) {
                const shapeType = shape.get('type');
                if (shapeType === 'text') {
                  fontSize = shape.attr('fontSize') || 12;
                  const itemStyle = itemStateStyle[shape.get('name')];
                  const shapeStyle = shapeStateStyle[shape.get('name')];
                  const itemFontSize = itemStyle ? itemStyle.fontSize : 12;
                  const shapeFontSize = shapeStyle ? shapeStyle.fontSize : 12;
                  const oriFontSize = itemFontSize || shapeFontSize || 12;
                  if (zoom <= 1) shape.attr('fontSize', oriFontSize / zoom); // * graphZoom / zoom
                  if (lineWidth) break;
                }
              }
              if (fixSelectedItems.fixLineWidth) {
                if (shape.get('isKeyShape')) {
                  lineWidth = shape.attr('lineWidth') || 0;
                  const oriLineWidth =
                    itemStateStyle.lineWidth ||
                    shapeStateStyle.lineWidth ||
                    originStyle.lineWidth ||
                    0;
                  if (zoom <= 1) shape.attr('lineWidth', oriLineWidth / zoom); // * graphZoom / zoom
                  if (fontSize) break;
                }
              }
            }
          }
        }

        const fixEdgesLength = fixEdges.length;
        for (let fe = 0; fe < fixEdgesLength; fe++) {
          const edge = fixEdges[fe];
          const group = edge.getContainer();
          const children = group.get('children');
          const nodeModel = edge.getModel();
          const itemStateStyle = edge.getStateStyle(fixSelectedItems.fixState);
          const shapeStateStyle = edge
            .get('shapeFactory')
            .getShape(nodeModel.type)
            .getStateStyle(fixSelectedItems.fixState, edge)[fixSelectedItems.fixState];

          const childrenLength = children.length;
          for (let c = 0; c < childrenLength; c++) {
            const shape = children[c];
            let fontSize, lineWidth;
            if (fixSelectedItems.fixLabel || fixSelectedItems.fixAll) {
              const shapeType = shape.get('type');
              if (shapeType === 'text') {
                fontSize = shape.attr('fontSize') || 12;
                const itemStyle = itemStateStyle[shape.get('name')];
                const shapeStyle = shapeStateStyle[shape.get('name')];
                const itemFontSize = itemStyle ? itemStyle.fontSize : 12;
                const shapeFontSize = shapeStyle ? shapeStyle.fontSize : 12;
                const oriFontSize = itemFontSize || shapeFontSize || 12;
                if (zoom <= 1) shape.attr('fontSize', oriFontSize / zoom);
                if (lineWidth) break;
              }
            }
            if (fixSelectedItems.fixLineWidth || fixSelectedItems.fixAll) {
              if (shape.get('isKeyShape')) {
                lineWidth = shape.attr('lineWidth') || 0;
                const oriLineWidth = itemStateStyle.lineWidth || shapeStateStyle.lineWidth || 1;
                if (zoom <= 1) shape.attr('lineWidth', oriLineWidth / zoom);
                if (fontSize) break;
              }
            }
          }
        }
      }
    }
    const animate = _this.get('animate');
    const animateCfg = _this.get('animateCfg');
    graph.zoomTo(zoom, { x: point.x, y: point.y }, animate, animateCfg);
    graph.emit('wheelzoom', e);
  }
})

G6.registerNode("erd-nodes", {
  draw: ((cfg: NodeData, group?: IGroup) => {
    const size: Size = { height: height(cfg), width: style.width }

    let keyShape = group!.addShape('rect', {
      name: cfg.originalKey,
      draggable: true,
      attrs: {
        id: 'keySharp',
        cursor: 'move',
        ...xy(0, 0, size),
        ...size,
        radius: style.radius,
        stroke: style.themeColor,
        fill: style.background
      }
    })

    if (group) render(cfg, group)

    return keyShape
  }) as any,
  // getAnchorPoints: () => {
  //   return roundAnchor(100)
  // },

  getAnchorPoints() {
    return [
      [0, 0],
      [1, 0],
    ];
  },
})

G6.registerEdge('erd-edge', {
  draw(cfg: any, group) {

    const edge = group.cfg.item;
    const { sourceFieldKey, targetFieldKey } = cfg
    const sourceNode = edge.getSource().getModel();
    const targetNode = edge.getTarget().getModel();

    const sourceIndex = sourceNode.fields.findIndex((e: any) => {
      return e.originalKey === sourceFieldKey
    }) - sourceNode.startIndex


    const targetIndex = targetNode.fields.findIndex((e: any) => {
      return e.originalKey === targetFieldKey
    }) - targetNode.startIndex

    const sourceMax = height(sourceNode)
    const targetMax = height(targetNode)
    const min = style.headerHeight

    const sourceOffset = style.headerHeight + (0.5 + sourceIndex) * style.fieldHeight
    const targetOffset = style.headerHeight + (0.5 + targetIndex) * style.fieldHeight


    const startPoint = { ...cfg.startPoint };
    const endPoint = { ...cfg.endPoint };

    startPoint.y = startPoint.y + Math.max(min, Math.min(sourceMax, sourceOffset))
    endPoint.y = endPoint.y + Math.max(min, Math.min(targetMax, targetOffset))

    const shape = group.addShape('path', {
      attrs: {
        stroke: '#333',
        path: [
          ['M', startPoint.x, startPoint.y],
          ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
          ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
          ['L', endPoint.x, endPoint.y],
        ],
        endArrow: true,
      },
      // must be assigned in G6 3.3 and later versions. it can be any value you want
      name: 'path-shape',
    });
    return shape;
  }
});