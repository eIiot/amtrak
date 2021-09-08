"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTrainData = void 0;
const axios_1 = require("axios");
const crypto = require("crypto-js");
const dataUrl = 'https://maps.amtrak.com/services/MapDataService/trains/getTrainsData';
const sValue = '9a3686ac';
const iValue = 'c6eb2f7f5c4740c1a2f708fefd947d39';
const publicKey = '69af143c-e8cf-47f8-bf09-fc1f61e5cc33';
const masterSegment = 88;
const fetchTrainData = async (i = 0) => {
    if (i > 3)
        throw Error('Issue');
    try {
        const { data } = await axios_1.default.get(dataUrl);
        const mainContent = data.substring(0, data.length - masterSegment);
        const encryptedPrivateKey = data.substr(data.length - masterSegment, data.length);
        const privateKey = decrypt(encryptedPrivateKey, publicKey).split('|')[0];
        const { features: parsed } = JSON.parse(decrypt(mainContent, privateKey));
        return parsed.map(({ geometry, properties }) => {
            const tempTrainData = {
                coordinates: geometry.coordinates
            };
            const filteredKeys = Object.keys(properties).filter((key) => key.startsWith('Station') && properties[key] != null);
            const sortedKeys = filteredKeys.sort((a, b) => parseInt(a.replace('Station', '')) - parseInt(b.replace('Station', '')));
            tempTrainData.Stations = sortedKeys.map((key) => JSON.parse(properties[key]));
            Object.keys(properties).forEach((key) => {
                if (!key.startsWith('Station') && !tempTrainData.hasOwnProperty(key))
                    tempTrainData[key] = properties[key];
            });
            return tempTrainData;
        });
    }
    catch (e) {
        return await (0, exports.fetchTrainData)();
    }
};
exports.fetchTrainData = fetchTrainData;
const decrypt = (content, key) => {
    return crypto.AES.decrypt(crypto.lib.CipherParams.create({ ciphertext: crypto.enc.Base64.parse(content) }), crypto.PBKDF2(key, crypto.enc.Hex.parse(sValue), { keySize: 4, iterations: 1e3 }), { iv: crypto.enc.Hex.parse(iValue) }).toString(crypto.enc.Utf8);
};
//# sourceMappingURL=amtrak.js.map