import { NodeData } from "@/mock/model-test";
import G6, { Graph, IGroup } from '@antv/g6';

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

const height = (node: NodeData) => style.headerHeight + style.fieldHeight * node.fields.length
const xy = (top: number, left: number, containerSize: Size) => ({
    x: left - (containerSize.width / 2),
    y: top - (containerSize.height / 2)
})
const fieldTop = (index: number) => {
    return style.headerHeight + index * style.fieldHeight + (style.fieldHeight - style.fieldFontSize) / 2
}
const size = ({ fields }: { fields: any[] }) => [style.width + 20, style.headerHeight + style.fieldHeight * fields.length + 20]
const render = (cfg: NodeData, group: IGroup) => {

    const size: Size = { height: height(cfg), width: style.width }
    const { radius, headerHeight, width, themeColor, fieldFontSize, textColor } = style

    const headerSize = { height: headerHeight, width, }

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

export class ERDg6 {
    nodes: NodeData[] = []
    static init() {
        G6.registerNode(
            'erd-nodes',
            {
                draw: ERDg6.draw as any,
                getAnchorPoints: ERDg6.anchor,
                update(cfg, node) { }
            },
            'rect',
        );
    }
    static draw = (cfg: NodeData, group?: IGroup) => {
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
    }
    static anchor = () => {
        return roundAnchor(100)
    }
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
                default: ['drag-canvas', 'drag-node', 'zoom-canvas'],
            },
            defaultNode: {
                type: 'erd-nodes',
            },
            defaultEdge: {
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
        this.graph.data(this.data())
        this.graph.render();
    }

    data() {

        const edges = this.nodes.flatMap(sourceNode => {
            return sourceNode.fields.map(field => {
                if (field.typeMeta) {
                    return {
                        source: sourceNode.originalKey,
                        target: field.typeMeta.relationModel
                    }
                }

                return null
            }).filter(v => !!v) as {
                source: string;
                target: string;
            }[]
        })

        return {
            nodes: this.nodes.map(v => Object.assign(v, { type: 'erd-nodes', size: size(v), id: v.originalKey })),
            edges: edges.map(v => Object.assign(v, { type: 'cubic-vertical', style: { endArrow: true } })),
        }


    }
}

ERDg6.init()