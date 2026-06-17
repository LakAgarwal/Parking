const QRCode = require('qrcode');
const { createQrCode } = require('../controllers/QrController')

const generateQRCodeBase64 = async (data) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data));
        return qrCodeDataUrl.split(',')[1]; // Extract the base64 data part
    } catch (error) {
        throw error;
    }
};

const QRGenerator = async (data = 'testing data') => {
    try {
        const base64DataUrl = await generateQRCodeBase64(data)
        const newQRCode = await createQrCode({path: base64DataUrl, user_id: data?.user_id, serial_no: data?.serial_no})

        return newQRCode
    } catch(error) {
        console.log(error)
        throw error
    }
}

module.exports = { QRGenerator }