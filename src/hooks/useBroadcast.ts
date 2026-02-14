import React, { useEffect, useState, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

export type BroadcastRole = 'host' | 'viewer' | 'none';

interface BroadcastManagerProps {
    onRoleChange: (role: BroadcastRole) => void;
    onConnectionId: (id: string) => void;
    onStateUpdate: (state: any) => void;
    onPDFData: (pdfBlob: Blob, collectionId: string) => void;
}

export interface BroadcastHandle {
    startHost: () => Promise<string>;
    joinSession: (hostId: string) => Promise<void>;
    sendState: (state: any) => void;
    sendPDF: (pdfBlob: Blob, collectionId: string) => void;
    disconnect: () => void;
}

// We'll export a hook or a component that exposes these functions
// For now, let's make it a custom hook

export const useBroadcast = ({ onRoleChange, onConnectionId, onStateUpdate, onPDFData }: BroadcastManagerProps): BroadcastHandle => {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [connections, setConnections] = useState<DataConnection[]>([]);
    const [role, setRole] = useState<BroadcastRole>('none');

    // Initialize Peer
    const initPeer = useCallback(() => {
        if (peer) return peer;
        const newPeer = new Peer();

        newPeer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            onConnectionId(id);
        });

        newPeer.on('error', (err) => {
            console.error('Peer error:', err);
        });

        setPeer(newPeer);
        return newPeer;
    }, [peer, onConnectionId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (peer) {
                peer.destroy();
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const startHost = useCallback(async (): Promise<string> => {
        const p = initPeer();
        setRole('host');
        onRoleChange('host');

        p.on('connection', (conn) => {
            console.log('Incoming connection:', conn.peer);

            conn.on('open', () => {
                setConnections(prev => [...prev, conn]);
                // Send initial state or handshake if needed?
                // Probably better to wait for app to push state
            });

            conn.on('data', (data) => {
                console.log('Received data from viewer:', data);
                // Viewers might send "ready" or "request PDF" 
            });

            conn.on('close', () => {
                setConnections(prev => prev.filter(c => c !== conn));
            });
        });

        return new Promise((resolve) => {
            if (p.id) resolve(p.id);
            p.on('open', (id) => resolve(id));
        });
    }, [initPeer, onRoleChange]);

    const joinSession = useCallback(async (hostId: string): Promise<void> => {
        const p = initPeer();
        setRole('viewer');
        onRoleChange('viewer');

        // Wait for peer to be ready
        if (!p.id) {
            await new Promise<void>(resolve => p.on('open', () => resolve()));
        }

        const conn = p.connect(hostId);

        conn.on('open', () => {
            console.log('Connected to host:', hostId);
            setConnections([conn]);
            // Send hello?
            conn.send({ type: 'hello', peerId: p.id });
        });

        conn.on('data', (data: any) => {
            // Handle different data types
            if (data && typeof data === 'object') {
                if (data.type === 'pdf') {
                    // Blob transfer
                    console.log('Received PDF data');
                    const blob = new Blob([data.payload], { type: 'application/pdf' });
                    onPDFData(blob, data.collectionId);
                } else if (data.type === 'state') {
                    onStateUpdate(data.payload);
                }
            }
        });

        conn.on('close', () => {
            console.log('Connection closed');
            setConnections([]);
            setRole('none');
            onRoleChange('none');
        });

    }, [initPeer, onRoleChange, onStateUpdate, onPDFData]);

    const sendState = useCallback((state: any) => {
        if (role !== 'host') return;
        connections.forEach(conn => {
            if (conn.open) {
                conn.send({ type: 'state', payload: state });
            }
        });
    }, [role, connections]);

    const sendPDF = useCallback((pdfBlob: Blob, collectionId: string) => {
        if (role !== 'host') return;
        // Convert Blob to ArrayBuffer for reliable transfer? 
        // PeerJS handles Blobs well usually, but explicit ArrayBuffer is safer
        pdfBlob.arrayBuffer().then(buffer => {
            connections.forEach(conn => {
                if (conn.open) {
                    conn.send({
                        type: 'pdf',
                        collectionId,
                        payload: buffer
                    });
                }
            });
        });
    }, [role, connections]);

    const disconnect = useCallback(() => {
        if (peer) {
            peer.disconnect();
            peer.destroy();
            setPeer(null);
        }
        setConnections([]);
        setRole('none');
        onRoleChange('none');
    }, [peer, onRoleChange]);

    return {
        startHost,
        joinSession,
        sendState,
        sendPDF,
        disconnect
    };
};
