declare module 'react-force-graph-2d' {
    import { Component } from 'react';

    interface GraphData {
        nodes: Array<{ id: string;[key: string]: any }>;
        links: Array<{ source: string; target: string;[key: string]: any }>;
    }

    interface ForceGraphProps {
        graphData: GraphData;
        nodeAutoColorBy?: string;
        nodeLabel?: string;
        linkDirectionalParticles?: number;
        [key: string]: any;
    }

    export default class ForceGraph2D extends Component<ForceGraphProps> { }
}
