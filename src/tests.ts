import GGroup from '@antv/g-canvas/lib/group'
import G6 from '@antv/g6/dist/g6.min.js'
import { IModelNodeShapeCfg, Relation } from './type'

import {
    getLength
} from './util'

export const register = mst => {
    // const colors = {
    //     blue : '#495D9E',
    //     white: '#FFFFFF',
    //     head: 'rgba(7,10,26,0.06)',
    //     black: 'black',
    // }
    // const models = mst.onReload().models

    G6.registerNode(
        'console-model-Node',
        {
            getAnchorPoints(cfg: IModelNodeShapeCfg) {
            },

            update(cfg: IModelNodeShapeCfg, item) {
            },

            render(cfg: IModelNodeShapeCfg, group: GGroup) {
                const {
                    config,
                    data,
                    selected,
                    showNameOrLabel,
                    themeColor,
                    darkness
                } = cfg
                const whiteBg = 'rgba(7,10,26,0.06)'
                // const bg = data.aggregateRoot || 1 ? colors.blue : colors.head
                // const font = data.aggregateRoot || 1 ? colors.white : colors.blue
                // const mFront = data.aggregateRoot  || 1? colors.white : colors.black
                const { colors } = config
                const bg = darkness ? themeColor : whiteBg
                //const bgArrange = cfg.data.aggregateModelKey  && bg ? whiteBg : themeColor
                const font = darkness ? colors.white : themeColor
                const mFront = darkness ? colors.white : themeColor
                const nodeColors = { bg, font, mFront }

                group.addShape('rect', {
                    visible: !cfg.isKeySharp,
                    name: data.key,
                    draggable: true,
                    attrs: {
                        y:
                            -(
                                (getLength(data.fields.length) *
                                    config.fieldHeight) /
                                2
                            ) -
                            config.headerHeight / 2,
                        x: -(config.width / 2),
                        width: config.width,
                        height: config.headerHeight,
                        radius: [10, 10, 0, 0],
                        // text: data.label,
                        id: 'header',
                        // fontSize: config.fieldHeight - 12,
                        // opacity: !cfg.isKeySharp ? 1 : 0,
                        className: 'header',
                        shadowColor: 'rgba(0,0,0,0.06)',
                        cursor: 'move',
                        // shadowBlur: 1,
                        // shadowOffsetX: 1,
                        // shadowOffsetY: 2,
                        // radius: [2, 4],
                        fill: selected
                            ? config.styleConfig.selected.node.stroke
                            : bg
                    }
                })

                group.addShape('text', {
                    visible: !cfg.isKeySharp,
                    name: data.key,
                    fontFamily: '',
                    draggable: true,
                    attrs: {
                        // fontFamily: 'iconFont',
                        x: -(config.width / 2) + 20,
                        y: -(
                            (getLength(data.fields.length) *
                                config.fieldHeight) /
                            2
                        ),
                        text: showNameOrLabel ? data.name : data.label,
                        fieldLable: data.name,
                        nameLable: data.label,
                        // text: '\ue6b2',
                        id: 'headerlabel1',
                        cursor: 'move',
                        fontSize: config.fieldHeight / 2,
                        // opacity: !cfg.isKeySharp ? 1 : 0,
                        className: 'headerlabel',
                        textBaseline: 'middle',
                        textAlign: 'left',
                        fontWeight: 20,
                        // radius: [2, 4],
                        fill: nodeColors.mFront
                    }
                })

                cfg.data.aggregateModelKey &&
                    group.addShape('text', {
                        visible: cfg.data.aggregateModelKey,
                        name: data.key,
                        fontFamily: '',
                        draggable: true,
                        attrs: {
                            fontFamily: 'iconFont',
                            x: config.width / 2 - 100,
                            y: -(
                                (getLength(data.fields.length) *
                                    config.fieldHeight) /
                                2
                            ),
                            text: '聚合关系',
                            arg: cfg.data.aggregateModelKey,
                            // text: cfg.data.aggregateModelKey,
                            // text: '\ue6b2',
                            id: 'headerlabel1',
                            cursor: 'pointer',
                            click: 'arrangeShow',
                            // cursor: 'move',
                            fontSize: config.labelSize,
                            // opacity: !cfg.isKeySharp ? 1 : 0,
                            className: 'headerlabel',
                            textBaseline: 'middle',
                            textAlign: 'left',
                            // radius: [2, 4],
                            fill: nodeColors.font
                        }
                    })

                group.addShape('text', {
                    visible: !cfg.isKeySharp,
                    name: data.key,
                    fontFamily: '',
                    draggable: true,
                    attrs: {
                        fontFamily: 'iconFont',
                        x: config.width / 2 - 40,
                        y: -(
                            (getLength(data.fields.length) *
                                config.fieldHeight) /
                            2
                        ),
                        text: '查看',
                        // text: '\ue6b2',
                        id: 'headerlabel1',
                        cursor: 'pointer',
                        click: 'modelEdit',
                        // cursor: 'move',
                        fontSize: config.labelSize,
                        // opacity: !cfg.isKeySharp ? 1 : 0,
                        className: 'headerlabel',
                        textBaseline: 'middle',
                        textAlign: 'left',
                        // radius: [2, 4],
                        fill: nodeColors.font
                    }
                })

                // const nameList = ((data.name.replace(/\(/, '-').replace(/\)/, '')) || '').split('_').flatMap((nameStr) => nameStr.split('-')).flatMap((nameStr) => nameStr.split('/')).flatMap((a) => getSplitStrings(a)).filter((a) => a)

                // const height = config.headerHeight + (data.fields.length >= 12 ? data.fields.length : 12) * config.fieldHeight
                // const nameLength = nameList.length
                // nameList.forEach((nameText, index) => {
                //     group.addShape('text', {
                //         visible: !cfg.isKeySharp,
                //         name: nameText,
                //         draggable: true,
                //         attrs: {
                //             x: 0,
                //             y: - height / 2 + height / (nameLength + 1) * (index + 1),
                //             fontSize: config.width / 5,
                //             text: nameText,
                //             // opacity: index === nameLength - 1 ? 1 : 0.3,
                //             id: 'headerlabel2',
                //             className: 'headerlabel',
                //             textBaseline: 'middle',
                //             textAlign: 'center',
                //             // radius: [2, 4],
                //             fill: 'black',
                //         },
                //     })
                // })

                const nameList = [data.label]
                const height =
                    config.headerHeight +
                    (data.fields.length >= 12 ? data.fields.length : 12) *
                    config.fieldHeight
                const nameLength = nameList.length
                nameList.forEach((nameText, index) => {
                    group.addShape('text', {
                        visible:
                            cfg.isKeySharp &&
                            !showNameOrLabel &&
                            !cfg.isCardSharp,
                        name: nameText,
                        showNameOrLabel: false,
                        draggable: true,
                        attrs: {
                            x: 0,
                            y:
                                -height / 2 +
                                (height / (nameLength + 1)) * (index + 1),
                            fontSize: config.width / 5,
                            text: nameText,
                            // opacity: index === nameLength - 1 ? 1 : 0.3,
                            id: 'headerlabel2',
                            className: 'headerlabel',
                            textBaseline: 'middle',
                            textAlign: 'center',
                            // radius: [2, 4],
                            fill: themeColor
                        }
                    })
                })

                // const nameList1 = ((data.key.replace(/\(/, '-').replace(/\)/, '')) || '').split('_').flatMap((nameStr) => nameStr.split('-')).flatMap((nameStr) => nameStr.split('/')).flatMap((a) => getSplitStrings(a)).filter((a) => a)
                const nameList1 = [data.name]
                const height1 =
                    config.headerHeight +
                    (data.fields.length >= 12 ? data.fields.length : 12) *
                    config.fieldHeight
                const nameLength1 = nameList.length
                nameList1.forEach((nameText, index) => {
                    group.addShape('text', {
                        visible:
                            cfg.isKeySharp &&
                            showNameOrLabel &&
                            !cfg.isCardSharp,
                        showNameOrLabel: true,
                        name: nameText,
                        draggable: true,
                        attrs: {
                            x: 0,
                            y:
                                -height1 / 2 +
                                (height1 / (nameLength1 + 1)) * (index + 1),
                            fontSize: config.width / 5,
                            text: nameText,
                            // opacity: index === nameLength - 1 ? 1 : 0.3,
                            id: 'headerlabel2',
                            className: 'headerlabel',
                            textBaseline: 'middle',
                            textAlign: 'center',
                            // radius: [2, 4],
                            fill: themeColor
                        }
                    })
                })

                data.fields.forEach((field, index) => {
                    // const {
                    //     relationModel,
                    //     // isForeign,
                    // } = field

                    const isForeign = field.typeMeta
                    const relationModel = field?.typeMeta?.relationModel

                    //字段是否存在关系
                    // const hasRelation = models.some(item => {
                    //     const arr = item.fields?.map(item => {
                    //         const { typeMeta = [] } = item
                    //         if (Array.isArray(typeMeta)) {
                    //             const hasRelationTypeMeta = typeMeta.some(
                    //                 item => field.name === item.field
                    //             )
                    //             return hasRelationTypeMeta
                    //         }
                    //     })
                    //     return arr.includes(true)
                    // })

                    const y =
                        -(
                            (config.headerHeight +
                                getLength(data.fields.length) *
                                config.fieldHeight) /
                            2
                        ) +
                        config.headerHeight +
                        config.fieldHeight * index +
                        config.fieldHeight / 2 -
                        2
                    group.addShape('rect', {
                        visible: !cfg.isKeySharp,
                        name: field.id,
                        draggable: true,
                        attrs: {
                            x: -(config.width / 2) + 2,
                            fieldName: field.id,
                            name: field.id,
                            draggable: true,
                            fieldBg: true,
                            arg: field.name,
                            fieldHover: true,
                            y:
                                -(
                                    (config.headerHeight +
                                        getLength(data.fields.length) *
                                        config.fieldHeight) /
                                    2
                                ) +
                                config.headerHeight +
                                config.fieldHeight * index,
                            // stroke: 'black',
                            width: config.width - 4,
                            id: 'field',
                            height: config.fieldHeight,
                            fill: 'white',
                            cursor: 'move'
                        }
                    })

                    group.addShape('path', {
                        visible: !cfg.isKeySharp,
                        draggable: true,
                        name: field.id,

                        attrs: {
                            draggable: true,
                            fieldName: field.id,
                            id: 'field-line',
                            name: field.id,
                            path: [
                                ['M', -config.width / 2 + 20, y + 2],
                                ['L', config.width / 2 - 40, y + 2]
                            ],
                            stroke: 'rgba(0,0,0,0.60)',
                            lineWidth: 1,
                            lineDash: [5, 5],
                            opacity: 0.1
                        }
                    })

                    const showCircle = isForeign
                    //|| hasRelation

                    showCircle &&
                        group.addShape('circle', {
                            visible: true,
                            name: field.id,
                            draggable: true,
                            themeColor: true,
                            attrs: {
                                x: -(config.width / 2) + 10,
                                fieldName: field.id,
                                name: field.id,
                                draggable: true,
                                arg: field.name,
                                fieldHover: true,
                                y:
                                    -(
                                        (config.headerHeight +
                                            getLength(data.fields.length) *
                                            config.fieldHeight) /
                                        2
                                    ) +
                                    config.headerHeight +
                                    config.fieldHeight * index +
                                    config.fieldHeight / 2 -
                                    2,
                                id: 'field',
                                r: 2,
                                fill: themeColor,
                                cursor: 'move'
                            }
                        })

                    group.addShape('text', {
                        visible: !cfg.isKeySharp,
                        name: field.id,
                        draggable: true,
                        themeColor: isForeign,
                        attrs: {
                            x: -config.width / 2 + 20,
                            fieldHover: true,
                            name: field.id,
                            draggable: true,
                            // click: 'fieldEdit',
                            y:
                                -(
                                    (config.headerHeight +
                                        getLength(data.fields.length) *
                                        config.fieldHeight) /
                                    2
                                ) +
                                config.headerHeight +
                                config.fieldHeight * index +
                                config.fieldHeight / 2,
                            text: showNameOrLabel ? field.name : field.label,
                            fieldLable: field.name,
                            nameLable: field.label,
                            fieldName: field.id,
                            arg: field.name,
                            fontSize: config.labelSize,
                            textBaseline: 'middle',
                            cursor: 'move',
                            id: 'field',
                            textAlign: 'start',
                            fill: isForeign ? themeColor : 'rgba(0,0,0,0.60)' // fill: 'rgb(153,153,153)',
                        }
                    })
                    const relationModelText = showNameOrLabel
                        ? field?.relationModel?.name
                        : field?.relationModel?.label
                    // console.log(relationModelText)
                    group.addShape('text', {
                        visible: !cfg.isKeySharp,
                        name: field.id,
                        draggable: true,
                        themeColor: isForeign,
                        attrs: {
                            x: config.width / 2 - 20,
                            fieldHover: !isForeign,

                            // click: 'fieldEdit',
                            y:
                                -(
                                    (config.headerHeight +
                                        getLength(data.fields.length) *
                                        config.fieldHeight) /
                                    2
                                ) +
                                config.headerHeight +
                                config.fieldHeight * index +
                                config.fieldHeight / 2,
                            text: isForeign && relationModelText
                                ? relationModelText
                                : `${field.type || ''}`,
                            fieldLable: isForeign
                                ? field.type && Relation[field.type]
                                    ? `${field?.relationModel?.name}(${Relation[
                                    field.type
                                    ] || ''})`
                                    : field?.relationModel?.name
                                : `${field.type || ''}`,
                            nameLable: isForeign
                                ? field.type && Relation[field.type]
                                    ? `${field?.relationModel?.label
                                    }(${Relation[field.type] || ''})`
                                    : field?.relationModel?.label
                                : `${field.type || ''}`,
                            id: 'field',
                            textBaseline: 'middle',
                            fieldName: field.id,
                            arg: field,
                            fontSize: config.labelSize,
                            click: isForeign ? 'fieldSelect' : undefined,
                            textAlign: 'right',
                            cursor: isForeign ? 'pointer' : 'undefined',
                            fill: isForeign ? themeColor : 'rgba(0,0,0,0.30)'
                        }
                    })

                    isForeign &&
                        group.addShape('circle', {
                            visible: true,
                            name: field.id,
                            draggable: true,
                            themeColor: true,
                            attrs: {
                                x: config.width / 2 - 10,
                                fieldName: field.id,
                                name: field.id,
                                draggable: true,
                                arg: field.name,
                                fieldHover: true,
                                y:
                                    -(
                                        (config.headerHeight +
                                            getLength(data.fields.length) *
                                            config.fieldHeight) /
                                        2
                                    ) +
                                    config.headerHeight +
                                    config.fieldHeight * index +
                                    config.fieldHeight / 2 -
                                    2,
                                id: 'field',
                                r: 2,

                                fill: themeColor,
                                cursor: 'move'
                            }
                        })
                })

                const diffLength =
                    getLength(data.fields.length) - data.fields.length
                if (diffLength) {
                    for (let i = 0; i < diffLength; i++) {
                        // ---
                        group.addShape('rect', {
                            name: i,
                            draggable: true,
                            visible: !cfg.isKeySharp,
                            attrs: {
                                x: -(config.width / 2) + 2,
                                y:
                                    -(
                                        (config.headerHeight +
                                            getLength(data.fields.length) *
                                            config.fieldHeight) /
                                        2
                                    ) +
                                    config.headerHeight +
                                    config.fieldHeight *
                                    (data.fields.length + i),
                                // stroke: 'black',
                                width: config.width - 4,
                                id: 'field',
                                height: config.fieldHeight,
                                fill: 'white',
                                cursor: 'move'
                            }

                            // ---
                        })
                    }
                }
            },

            draw(cfg: IModelNodeShapeCfg, group) {
                const { config, data, selected } = cfg
                const height =
                    config.headerHeight +
                    getLength(data.fields.length) * config.fieldHeight
                let keyShape = group!.addShape('rect', {
                    name: data.key,
                    draggable: true,
                    // visible: false,
                    attrs: {
                        id: 'keySharp',
                        x: -(config.width / 2),
                        y: -height / 2,
                        width: config.width,
                        cursor: 'move',
                        // fill:'red',
                        height: height + 10,
                        ...cfg.config.styleConfig.default.node,
                        stroke: selected
                            ? cfg.config.styleConfig.selected.node.stroke
                            : cfg.config.styleConfig.default.node.stroke
                    }
                })

                this.render(cfg, group)
                return keyShape
            }
        },
        'single-shape'
    )
}