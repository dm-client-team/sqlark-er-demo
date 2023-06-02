import { edges, nodes } from '@/mock/model-test';
import G6 from '@antv/g6';

import { draw, size } from './draw';

export const render = new class {
    height = 480
    width = 800

    init(container: HTMLElement) {
        G6.registerNode(
            'card-node',
            {
                draw: draw as any,
                update(cfg, node){}
            },
            'rect',
        );

        const width = container.scrollWidth;
        const height = container.scrollHeight || 500;
        const graph = new G6.Graph({
            container: container,
            width,
            height,
            layout: {
                type: 'force',
                // type: 'force2',
                preventOverlap: true,
                nodeSpacing: 80,
            },
            // translate the graph to align the canvas's center, support by v3.5.1
            fitCenter: true,
            modes: {
                default: ['drag-canvas', 'drag-node', 'zoom-canvas'],
            },
            defaultNode: {
                type: 'card-node',
            },
            defaultEdge: {
                // ...                 // 边的其他配置
                // 边样式配置
                style: {
                  opacity: 0.5, // 边透明度
                  lineWidth: 5,
                  stroke: 'red', // 边描边颜色
                },
                // 边上的标签文本配置
                labelCfg: {
                  autoRotate: true, // 边上的标签文本根据边的方向旋转
                },
              },
            fitView: true,
        });



        graph.data(data as any);
        graph.render();

        if (typeof window !== 'undefined')
            window.onresize = () => {
                if (!graph || graph.get('destroyed')) return;
                if (!container || !container.scrollWidth || !container.scrollHeight) return;
                graph.changeSize(container.scrollWidth, container.scrollHeight);
            };

        return
    }


}

const data = {
    nodes: nodes.map(v => Object.assign(v, { size: size(v),id:v.originalKey })),
    edges,
};
