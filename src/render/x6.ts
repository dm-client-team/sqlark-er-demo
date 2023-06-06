import { NodeData } from "@/mock/model-test";
import { ForceLayout } from '@antv/layout';
import { Graph } from '@antv/x6';


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
const size = ({ fields }: { fields: any[] }) => [style.width + 20, style.headerHeight + style.fieldHeight * fields.length + 20]

export class ERDx6 {

    static init() {
        const LINE_HEIGHT = 24
        const NODE_WIDTH = 150
        Graph.registerNode(
            'er-rect',
            {
                inherit: 'rect',
                markup: [
                    {
                        tagName: 'rect',
                        selector: 'body',
                    },
                    {
                        tagName: 'text',
                        selector: 'label',
                    },
                ],
                attrs: {
                    rect: {
                        strokeWidth: 1,
                        stroke: '#5F95FF',
                        fill: '#5F95FF',
                    },
                    label: {
                        fontWeight: 'bold',
                        fill: '#ffffff',
                        fontSize: 12,
                    },
                },
                ports: {
                    groups: {
                        list: {
                            markup: [
                                {
                                    tagName: 'rect',
                                    selector: 'portBody',
                                },
                                {
                                    tagName: 'text',
                                    selector: 'portNameLabel',
                                },
                                {
                                    tagName: 'text',
                                    selector: 'portTypeLabel',
                                },
                            ],
                            attrs: {
                                portBody: {
                                    width: NODE_WIDTH,
                                    height: LINE_HEIGHT,
                                    strokeWidth: 1,
                                    stroke: '#5F95FF',
                                    fill: '#EFF4FF',
                                    magnet: true,
                                },
                                portNameLabel: {
                                    ref: 'portBody',
                                    refX: 6,
                                    refY: 6,
                                    fontSize: 10,
                                },
                                portTypeLabel: {
                                    ref: 'portBody',
                                    refX: 95,
                                    refY: 6,
                                    fontSize: 10,
                                },
                            },
                            position: 'erPortPosition',
                        },
                    },
                },
            },
            true,
        )

    }
    nodes: NodeData[] = []
    graph: Graph
    container: HTMLElement
    constructor(container: HTMLElement) {
        this.container = container

        const width = container.scrollWidth;
        const height = container.scrollHeight || 500;
        const graph = new Graph({
            container,
            width,
            height,
            background: {
                color: '#fffbe6', // 设置画布背景颜色
            },
            grid: {
                size: 10,      // 网格大小 10px
                visible: true, // 渲染网格背景
            },
            scroller: {
                enabled: true,
            },

            mousewheel: {
                enabled: true,
                modifiers: ['ctrl', 'meta'],
            },
        } as any);


        this.graph = graph

    }


    render(nodes?: NodeData[]) {
        if (nodes) { this.nodes = nodes }

        const data = this.data()

        const layout = new ForceLayout({
            type: 'force',

            preventOverlap: true,
            nodeSpacing: 120,
            tick: (() => {
                let timeout: any = null


                return () => {
                    if (timeout) clearTimeout(timeout)
                    timeout = setTimeout(() => {
                        this.graph.fromJSON(data)
                    }, 200);
                }
            })()
        })
        layout.layout(data)
        this.graph.zoom(-0.93)

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
            nodes: this.nodes.map(v => Object.assign(v, { width: size(v)[0], height: size(v)[1], id: v.originalKey })),
            edges: edges.map(v => Object.assign(v, {
                router: {
                    name: 'er',
                    padding: 40,
                },
                style: { endArrow: true }
            })),
        }


    }
}