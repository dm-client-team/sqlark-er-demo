import { NodeData } from '@/mock/model-test';
import { G6Event, G6GraphEvent, Graph, IBBox, IG6GraphEvent, IPoint, Util } from '@antv/g6';
import { ext } from '@antv/matrix-util';
const { clone } = Util
const { transform } = ext;
const DELTA = 0.05;

const itemCount = 10


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

export const ErnodeScroll = {
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
    e.stopPropagation()
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
      });
    }

  }
}

export const ZoomCanvasOutsideNode = {
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
      touchstart: 'onTouchStart',
      touchmove: 'onTouchMove',
      touchend: 'onTouchEnd',
    };
  },
  onWheel(e: IG6GraphEvent) {
    const _this = this as any
    const { graph, fixSelectedItems } = _this;

    const nodes = graph.getNodes().filter((n:any) => {
      const bbox = n.getBBox();
      return isInBBox(graph.getPointByClient(e.clientX, e.clientY), bbox);
    });

    if(nodes.length) return 

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
  },
};