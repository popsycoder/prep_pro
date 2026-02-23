// OTP Sending Utility
// For now, we'll just log the OTP to console (development mode)
// Later, integrate with SMS gateway (MSG91, Twilio, etc.)

const sendOTP = async (mobile, otp) => {
  try {
    // TODO: Integrate real SMS service
    // For development: Just log to console
    console.log('\n📱 ========== OTP MESSAGE ==========');
    console.log(`📞 To: ${mobile}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Valid for: 10 minutes`);
    console.log('===================================\n');

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'OTP sent successfully (Development Mode)',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only return OTP in dev mode
    };

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
};

// For production, use this template:
/*
const sendOTP = async (mobile, otp) => {
  try {
    // Using MSG91
    const response = await axios.post('https://api.msg91.com/api/v5/otp', {
      authkey: process.env.SMS_API_KEY,
      mobile: mobile,
      otp: otp,
      sender: process.env.SMS_SENDER_ID,
      message: `Your VIDYA-NIKETAN OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`
    });

    return {
      success: true,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
};
*/

module.exports = sendOTP;