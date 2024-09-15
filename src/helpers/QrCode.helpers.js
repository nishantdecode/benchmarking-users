const QRCodeInstance = require('qrcode');
class QRCode {
    generateForTerminal = async (data) => {
        try{
            const stringData = JSON.stringify(data);
            const result = await QRCodeInstance.toString(stringData,{type:'terminal'});
            return result;
        } catch(ex){
            throw new Error(ex.message);
        }
    }
    publish = async (data) =>{
        try{
            const stringData = JSON.stringify(data);
            const result = await QRCodeInstance.toDataURL(stringData);
            return result;
        } catch(ex){
            throw new Error(ex.message);
        }
    }
}
module.exports = new QRCode();