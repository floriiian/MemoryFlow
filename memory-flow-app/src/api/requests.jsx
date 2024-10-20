const JAVA_API_URL = 'http://localhost:8888';

export const postRequest = async (endpoint, data) => {

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(`${JAVA_API_URL}/${endpoint}`, request);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const responseData = isJson ? await response.json() : null;

        if (!response.ok) {
            return Promise.reject({
                status: response.status,
                message: responseData?.status || response.statusText,
            });
        }
        return responseData;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};