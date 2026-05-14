import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testChat() {
    try {
        console.log('Registering/Logging in...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'teststudent@gmail.com',
                password: 'password123'
            });
            token = loginRes.data.token;
        } catch (err) {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Student',
                email: 'teststudent@gmail.com',
                password: 'password123',
                role: 'student'
            });
            token = regRes.data.token;
        }
        console.log('Auth successful.');

        console.log('Sending message to chatbot...');
        const chatRes = await axios.post(`${API_URL}/chat/message`, 
            { content: 'I am feeling stressed.' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Response from chatbot:', chatRes.data.message.content);
    } catch (err) {
        console.error('Error in test script:', err.response?.data || err.message);
    }
}

testChat();
