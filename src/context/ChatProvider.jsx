import { createContext, useState, useEffect, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // Only connect if the user is logged in
        if (!user) return;

        // Change this URL if your Spring Boot backend runs on a different port
        const socket = new SockJS('http://localhost:8080/ws/chat'); 
        
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            },
            onDisconnect: () => {
                setIsConnected(false);
            }
        });

        client.activate();
        setStompClient(client);

        // Cleanup on unmount or logout
        return () => {
            client.deactivate();
        };
    }, [user]);

    return (
        <ChatContext.Provider value={{ stompClient, isConnected }}>
            {children}
        </ChatContext.Provider>
    );
};