import IconCN from '@/components/Icon';
import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Props, Rnd } from 'react-rnd';
import './index.less';

interface PropsState {
    x?: number
    y?: number
    w?: number | string
    h?: number | string
    zIndex?: number,
    show?: boolean
    icon?: React.ReactNode
    title: string | React.ReactNode
    iconFactory?: (_icon: string) => React.ReactNode
    menus?: React.ReactNode[]
    content: string | React.ReactNode
    config?: Props // 额外对外暴露rnd配置
    onPin?: () => void
    onMinimize?: () => void
    onMaxmize?: () => void
    onClose?: () => void
    updateZIndex?: (_front?: boolean) => void
    update: (_pos: {
        x?: number
        y?: number
        w?: number | string
        h?: number | string
    }) => void
}
interface Position {
    x?: number
    y?: number
    w?: number | string
    h?: number | string
}

const FloatWindow = (props: PropsState) => {
    const mergeConfig = () => {
        return {
            ...{
                x: 400,
                y: 200,
                w: 680,
                h: 300,
                zIndex: 10,
                show: true,
                icon: <IconCN style={{ color: "purple" }} type='icon-moxing' />,
                menus: [
                    // <Button type="text" icon={<IconCN style={{ color: "white" }} type="icon-export" />}
                    //     onClick={() => {
                    //         config.updateZIndex && config.updateZIndex(true)
                    //     }}
                    // ></Button>,
                    <Button type="text" icon={<IconCN style={{ color: "white" }} type="icon-pin1" />}
                        onClick={() => {
                            if (props.onPin) {
                                props.onPin()
                            }
                        }}
                    ></Button>,
                    // <Button type="text" icon={<IconCN style={{ color: "white" }} type="icon-window-minimize2"
                    //     onClick={(e) => {
                    //         // if (props.onMaxmize) {
                    //         //     props.onMaxmize()
                    //         // }
                    //         e.stopPropagation()


                    //     }}
                    // />}></Button>,
                    <Button type="text" icon={<IconCN style={{ color: "white" }} type="icon-maxmize1"
                        onDrag={() => {
                            // e.stopPropagation()
                            // e.preventDefault()
                        }}

                        onMouseDown={(e) => {
                            e.stopPropagation()
                            if (!fullScreen) {
                                // 非全屏
                                const pos: Position = {
                                    ...rndRef.current?.getDraggablePosition(),
                                    w: winRef?.style.width || config.w!,
                                    h: winRef?.style.height || config.h!,
                                }

                                rndRef.current?.updatePosition({
                                    x: 15,
                                    y: 2
                                })
                                rndRef.current?.updateSize({
                                    width: "98vw",
                                    height: "98vh"
                                })

                                setOldPos(pos)
                                setFullScreen(true)

                                return
                            }

                            // 全屏
                            rndRef.current?.updatePosition({
                                x: oldPos?.x || config.x!,
                                y: oldPos?.y || config.y!
                            })

                            rndRef.current?.updateSize({
                                width: oldPos?.w || config.w!,
                                height: oldPos?.h || config.h!
                            })

                            setFullScreen(false)
                            // e.preventDefault()
                            // setFullScreen(!fullScreen)
                        }}
                        onDragStart={() => {
                            // e.stopPropagation()
                            // e.preventDefault()
                        }}
                        onClick={() => {
                            // e.stopPropagation()
                            // e.preventDefault()
                            // console.log(666);
                            // setDragging(false)
                            // setFullScreen(!fullScreen)


                        }}
                    />}></Button >,
                    <Button type="text" icon={<IconCN style={{ color: "white" }} type="icon-close1"
                        onClick={(e) => {

                            e.stopPropagation()
                            config.onClose && config.onClose()

                        }}
                    />}></Button>,
                ]
            }
            , ...props
        }
    }
    const [dragging, setDragging] = useState(false)
    const [oldPos, setOldPos] = useState<Position>()
    const [fullScreen, setFullScreen] = useState(false)
    const [maxSize, setMaxSize] = useState<{
        w: string | number,
        h: string | number
    }>()

    const rndRef = useRef<Rnd>(null)
    let winRef: HTMLElement | undefined = undefined

    const [config, setConfig] = useState<PropsState>(mergeConfig())

    useEffect(() => {
        setConfig(mergeConfig())
    }, [props, fullScreen])

    useEffect(() => {
        if (fullScreen) {
            return
        }
        if (oldPos) {
            if (
                oldPos.x === config.x
                && oldPos.y === config.y
                && oldPos.w === config.w
                && oldPos.h === config.h
            ) {
                return
            }
            setOldPos({
                x: config.x,
                y: config.y,
                w: config.w,
                h: config.h
            })
        }
        if (!maxSize) {
            setMaxSize({
                w: oldPos?.w || 680,
                h: oldPos?.h || 300
            })
        }
    }, [config])

    useEffect(() => {
        if (fullScreen) {
            const nms = {
                w: "98vw",
                h: "98vh"
            }
            if (maxSize?.h !== nms.h || maxSize.w !== nms.w) {
                setMaxSize(
                    nms
                )
            }
        } else {
            if (maxSize?.h !== oldPos?.h || maxSize?.w !== oldPos?.w) {
                setMaxSize(
                    {
                        w: oldPos?.w || 500,
                        h: oldPos?.h || 500
                    }
                )
            }
        }
    }, [oldPos, fullScreen])

    return <Rnd
        ref={rndRef}
        {...(props.config || {})}
        className='float-window-dnd'
        style={
            {
                ... {
                    ... (config.show ? { zIndex: config.zIndex } : { display: "none" }),
                    ...(fullScreen ? { top: 0, left: 0, width: "100vw", height: "100vh" } : {
                        // maxWidth: config.w,
                        // maxHeight: config.h
                    })
                }
            }
        }

        // onClick={() => {

        //     // config.updateZIndex && config.updateZIndex(true)
        // }}
        onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()

        }}
        onMouseEnter={() => {
            // 这种貌似还行,就是触发的有些频繁,感觉如果自己本身就是最大zIndex就不变了
            config.updateZIndex && config.updateZIndex(true)
        }}
        // onMouseDown={() => {
        //     // 这种因为重新渲染会卡顿
        //     config.updateZIndex && config.updateZIndex(true)
        // }}
        default={
            {
                x: config.x!,
                y: config.y!,
                width: config.w!,
                height: config.h!,
            }
        }
        position={
            fullScreen ? {
                x: 0,
                y: 0,
            } : undefined
        }
        size={
            fullScreen ? {
                width: "100vw",
                height: "100vh"
            } : undefined
        }
        onDragStart={() => {
            setDragging(true)
        }}
        onDragStop={(e, d) => {
            const nps = {
                ...oldPos,
                x: d.x,
                y: d.y

            }

            setOldPos(
                nps
            )
            // setDragging(false)
        }}

        onResizeStop={(_e, _dir, element, _delta, pos) => {

            setOldPos({
                x: pos.x,
                y: pos.y,
                w: element.style.width,
                h: element.style.width
            })
        }}
        // minWidth={150}
        // minHeight={150}/
        enableResizing={!fullScreen}
        disableDragging={fullScreen}
        enableUserSelectHack={true}
        bounds="window"
    >
        <div className='float-window' ref={(ref) => {
            winRef = ref!
        }} >
            <div className='float-window-title'>
                <div className='float-window-title-label'>
                    <div className='float-window-title-label-icon'>
                        {
                            config.icon
                        }
                    </div>
                    <div className='float-window-title-label-content'>
                        {config.title}
                    </div>
                </div>
                <div className='float-window-title-menuns'>
                    {config.menus}
                </div>
            </div>
            <div className='float-window-body-wrapper'>
                <div className='float-window-body'

                    style={{
                        // maxWidth: maxSize?.w,
                        // maxHeight: maxSize?.h
                        // maxWidth: "100%",
                        // maxHeight: "100%"
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation()
                    }}
                    // onClick={(e) => {
                    //     e.stopPropagation()
                    //     e.preventDefault()
                    // }}
                    onDrag={(e) => {
                        e.stopPropagation()
                    }}
                >
                    {config.content}
                </div>
            </div>
        </div>
    </Rnd >

    // return <div
    //     style={
    //         {
    //             top: 200,
    //             left: 200,
    //             width: 200,
    //             height: 200
    //         }
    //     }
    // >
    //     <Rnd
    //         default={{
    //             x: props.x || 200,
    //             y: props.y || 200,
    //             width: props.w || 500,
    //             height: props.y || 500,
    //         }}
    //         minWidth={500}
    //         minHeight={190}
    //         bounds="window"
    //     >
    //         <div>
    //             <div>
    //                 {props.title}
    //             </div>
    //             <div>
    //                 {props.content}
    //             </div>
    //         </div>
    //     </Rnd>
    // </div>

}
export default FloatWindow