import axios from 'axios';

const SMS_API_BASE_URL = import.meta.env.VITE_SMS_API_BASE_URL;
const USERNAME = import.meta.env.VITE_SMS_API_USERNAME;
const PASSWORD = import.meta.env.VITE_SMS_API_PASSWORD;
const SOURCE_ADDRESS = import.meta.env.VITE_SMS_API_SOURCE_ADDRESS;

// Validate required environment variables
if (!SMS_API_BASE_URL || !USERNAME || !PASSWORD || !SOURCE_ADDRESS) {
  console.error('Missing required SMS API environment variables');
}

interface LoginResponse {
  status: string;
  comment?: string;
  token: string;
  refreshToken?: string;
  userData: {
    defaultMask: string;
    id: number;
    mobile: number;
    email: string;
  };
}

interface SMSResponse {
  status: string;
  message: string;
  data?: any;
}

let authToken: string | null = null;

export const loginToSMSService = async (): Promise<string> => {
  try {
    if (!USERNAME || !PASSWORD) {
      throw new Error('SMS API credentials not configured');
    }

    console.log('🔑 Attempting to login to SMS service...');

    const response = await axios.post<LoginResponse>(
      `${SMS_API_BASE_URL}/v1/login`,
      { 
        username: USERNAME, 
        password: PASSWORD 
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📡 SMS Login Response:', {
      status: response.data.status,
      comment: response.data.comment,
      hasToken: !!response.data.token,
      userData: {
        id: response.data.userData?.id,
        mobile: response.data.userData?.mobile,
        email: response.data.userData?.email
      }
    });

    if (response.data.status === 'success' && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Successfully logged in to SMS service');
      return response.data.token;
    }

    throw new Error('Failed to login to SMS service');
  } catch (error) {
    console.error('❌ SMS Login Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    throw new Error('Failed to authenticate with SMS service');
  }
};

export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    if (!SOURCE_ADDRESS) {
      throw new Error('SMS API source address not configured');
    }

    // If no auth token exists or it's expired, login again
    if (!authToken) {
      console.log('🔄 No auth token found, logging in...');
      authToken = await loginToSMSService();
    }

    // Format phone number (remove any non-digits and ensure it starts with 94)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const finalNumber = formattedNumber.startsWith('94') 
      ? formattedNumber 
      : `94${formattedNumber}`;

    console.log('📱 Sending SMS to:', finalNumber);
    console.log('📝 Message:', message);

    const smsPayload = {
      msisdn: [{ mobile: finalNumber }],
      sourceAddress: SOURCE_ADDRESS,
      message: message,
      transaction_id: `${Date.now()}`,
      payment_method: "0"
    };

    console.log('📦 SMS Request Payload:', smsPayload);

    const response = await axios.post<SMSResponse>(
      `${SMS_API_BASE_URL}/v2/sms`,
      smsPayload,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📡 SMS API Response:', {
      status: response.data.status,
      message: response.data.message,
      data: response.data.data
    });

    if (response.data.status === 'success') {
      console.log('✅ SMS sent successfully');
      return true;
    }

    // If the token is expired, try to login again and resend
    if (response.data.message?.toLowerCase().includes('token')) {
      console.log('🔄 Token expired, refreshing and retrying...');
      authToken = await loginToSMSService();
      return sendSMS(phoneNumber, message);
    }

    console.log('❌ Failed to send SMS:', response.data.message);
    return false;
  } catch (error) {
    console.error('❌ SMS Sending Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    
    // If it's an auth error, try to login again and resend
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        console.log('🔄 Auth error, refreshing token and retrying...');
        authToken = await loginToSMSService();
        return sendSMS(phoneNumber, message);
      } catch (retryError) {
        console.error('❌ SMS Retry Error:', retryError);
        return false;
      }
    }
    
    return false;
  }
}; 