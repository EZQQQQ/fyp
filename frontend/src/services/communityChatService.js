// frontend/src/services/communityChatService.js
import axios from '../utils/axiosConfig';

const joinChat = async (communityId) => {
	const response = await axios.post(`/api/chat/${communityId}/join`);
	return response.data; // Expected { name: "unique-anonymous-name" }
};

const leaveChat = async (communityId, name) => {
	const response = await axios.post(`/api/chat/${communityId}/leave`, { name });
	return response.data;
};

const sendMessage = async (messageData) => {
	const response = await axios.post(`/api/chat/message`, messageData);
	return response.data;
};

const communityChatService = {
	joinChat,
	leaveChat,
	sendMessage,
};

export default communityChatService;
