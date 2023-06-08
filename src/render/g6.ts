import { NodeData } from "@/mock/model-test";
import G6, { Graph } from '@antv/g6';
import { size } from './register';

export class ERDg6 {
    nodes: NodeData[] = []
    graph: Graph
    constructor(container: HTMLElement) {
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
                default: ['drag-canvas', 'drag-node', 'dice-er-scroll', 'zoom-canvas-outside-node',],
            },
            defaultNode: {
                type: 'erd-nodes',
            },
            defaultEdge: {
                type: 'erd-edge',
                style: {
                    opacity: 0.5, // 边透明度
                    lineWidth: 5,
                    stroke: 'red', // 边描边颜色
                }
            },
            fitView: true
        });


        this.graph = graph

        return
    }
    render(nodes?: NodeData[]) {
        if (nodes) { this.nodes = nodes }
        console.log(this.data())
        this.graph.data(this.data())
        this.graph.render();
    }
    data() {
        const edges = this.nodes.flatMap(sourceNode => {
            return sourceNode.fields.map(field => {
                if (field.typeMeta) {
                    return {
                        source: sourceNode.originalKey,
                        sourceFieldKey: field.originalKey,
                        target: field.typeMeta.relationModel,
                        targetFieldKey: field.typeMeta.relationField
                    }
                }

                return null
            }).filter(v => !!v) as {
                source: string;
                target: string;
                sourceFieldKey: string;
                targetFieldKey: string;
            }[]
        })
        return {
            nodes: this.nodes.map(v => Object.assign(v, { type: 'erd-nodes', size: size(v), id: v.originalKey })),
            edges: edges.map(v => Object.assign(v, { style: { endArrow: true } })),
        }


    }
}
