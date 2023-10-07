import dagre from 'dagre';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    MiniMap,
    Node,
    Position,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges
} from 'reactflow';

import { Switch } from 'antd';
import 'reactflow/dist/style.css';
import MonacoCodeEditor from '../../CodeEditor';
import TypeDefinitionCard from './TypeDefinition';
import { FlowInfo, anotherConvert, convert } from './TypeDefinition/TypeDefinionHandler';

interface Props {
    td: Core.TypeDefinition
}
const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));


export default function FlowExample(props: Props) {
    const nodeTypes = useMemo(() => ({ td: TypeDefinitionCard }), []);

    const [flowInfo, setFlowInfo] = useState<FlowInfo>()
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [flowJson, setFlowJson] = useState<string>("")
    const [source, setSouce] = useState(false);
    const [expand, setExpand] = useState(false)

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );
    const nodeWidth = useCallback(() => {
        return expand ? 150 : 150
    }, [expand]);
    const nodeHeight = useCallback(() => {
        return expand ? 50 : 120
    }, [expand]);

    const getLayoutedElements = ({ nodes, edges }: FlowInfo, direction = 'LR'): FlowInfo => {

        const isHorizontal = direction === 'LR';// LR|TB
        dagreGraph.setGraph({ rankdir: direction });

        nodes.forEach((node) => {

            dagreGraph.setNode(node.id, { width: nodeWidth(), height: nodeHeight() });
            // dagreGraph.setNode(node.id, { width: nodeWidth(), height: (node.data.td?.type.items || 1) * 40 });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);
        nodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.targetPosition = isHorizontal ? Position.Left : Position.Top;
            node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            node.position = {
                x: nodeWithPosition.x - nodeWidth() / 2,
                y: nodeWithPosition.y - nodeHeight() / 2,
            };

            return node;
        });

        return { nodes, edges };
    };

    useEffect(() => {
        setFlowInfo(getLayoutedElements(expand ? convert(props.td) : anotherConvert(props.td)))
    }, [props, expand])

    useEffect(() => {

        if (flowInfo) {
            setNodes(flowInfo.nodes)
            setEdges(flowInfo.edges)
            setFlowJson(JSON.stringify(flowInfo))
        }

    }, [flowInfo])

    // const onConnect = useCallback(
    //     (params) =>
    //         setEdges((eds) =>
    //             addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
    //         ),
    //     []
    // );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);


    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div>
                <Switch
                    checked={source}
                    checkedChildren="源码"
                    unCheckedChildren="源码"
                    onChange={() => {
                        setSouce(!source)
                    }}
                />
                <Switch
                    // style={source ? {
                    //     display: "none"
                    // } : {}}
                    checked={expand}
                    checkedChildren="展开节点"
                    unCheckedChildren="展开节点"
                    onChange={() => {
                        setExpand(!expand)
                    }}
                />
            </div>
            {
                !source ?
                    <ReactFlow
                        nodeTypes={nodeTypes}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={() => { }}
                        fitView
                    >
                        <Controls />
                        <MiniMap />
                        {/* <Controls /> */}
                        <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                    : <MonacoCodeEditor
                        code={flowJson}
                        config={
                            {
                                height: "80vh"
                            }
                        }
                    />
            }
        </div>
    );
}