const axios = require('axios');

async function testCartSync() {
    try {
        const res = await axios.post('http://127.0.0.1:5000/api/cart', {}, {
            headers: {
                // We need a valid token to test this, so this might fail with 401
                // But if it fails with 500 without a token, that's a clue.
            }
        });
        console.log(res.data);
    } catch (err) {
        console.log("Status:", err.response?.status);
        console.log("Data:", err.response?.data);
    }
}

testCartSync();
