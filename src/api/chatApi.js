import api from './axiosConfig';

export const getChatHistory = async (targetType, targetId, page = 0, size = 30, recipientId = null) => {
    // 1. Build the base URL
    let url = `/chat/history/${targetType}/${targetId}?page=${page}&size=${size}`;
    
    // 2. CRITICAL FIX: If a recipientId exists (meaning it's a DM), attach it to the request!
    if (recipientId) {
        url += `&recipientId=${recipientId}`;
    }

    const response = await api.get(url);
    return response.data;
};