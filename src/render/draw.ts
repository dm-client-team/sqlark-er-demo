import { IGroup, ModelConfig } from "@antv/g6";

interface NodeModelConfig extends ModelConfig {
    name: string;
    originalKey: string;
    label: string;
    module: string;
    fields: ({
        type: string;
        name: string;
        originalKey: string;
        typeMeta?: {
            relationModel: string;
            type: string;
        };
        label: string
    })[];
}


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

type Size = { width: number, height: number }
const height = (node: NodeModelConfig) => style.headerHeight + style.fieldHeight * node.fields.length
const xy = (top: number, left: number, containerSize: Size) => ({
    x: left - (containerSize.width / 2),
    y: top - (containerSize.height / 2)
})


const fieldTop = (index: number) => {
    return style.headerHeight + index * style.fieldHeight + (style.fieldHeight - style.fieldFontSize) / 2
}


export const size = ({ fields }: { fields: any[] }) => [style.width + 20, style.headerHeight + style.fieldHeight * fields.length + 20]
export const draw = (cfg: NodeModelConfig, group?: IGroup) => {
    const size: Size = { height: height(cfg), width: style.width }

    let keyShape = group!.addShape('rect', {
        name: cfg.originalKey,
        draggable: true,
        attrs: {
            id: 'keySharp',
            ...xy(0, 0, size),
            ...size,
            cursor: 'move',
            radius: style.radius,
            stroke: style.themeColor,
            fill: style.background
        }
    })

    if (group) render(cfg, group)

    return keyShape
}

export const render = (cfg: NodeModelConfig, group: IGroup) => {

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