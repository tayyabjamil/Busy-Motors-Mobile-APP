import axios from "axios";
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';

const axiosInstance = axios.create({
    baseURL: Config.API_BASE_URL,
    headers: {
        "Cache-Control": "no-cache",
        "Accept": "application/json",
        'Content-Type':'multipart/form-data'
    },
});

export const axiosHeader = async (token) => {
    if (token) {
        const deviceId = await DeviceInfo.getUniqueId();
        
        // Set both Authorization and device-id headers
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axiosInstance.defaults.headers.common["device-id"] = deviceId;
    } else {
        // Clear both headers when no token
        delete axiosInstance.defaults.headers.common["Authorization"];
        delete axiosInstance.defaults.headers.common["device-id"];
    }
    return axiosInstance;
};