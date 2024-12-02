function setStorageSessions(sessionDataItemName, sessionDataItemValue) {
    var session = JSON.parse(sessionStorage.setItem({sessionDataItemName}, sessionDataItemValue));
}
function getStorageSessions(sessionDataItemName, sessionDataItemValue) {
    var session = JSON.parse(sessionStorage.getItem({sessionDataItemName}, sessionDataItemValue));
    if (session) {
        var sessionData = session.data;
        var sessionDataLength = sessionData.length;
        for (var i = 0; i < sessionDataLength; i++) {
            var sessionDataItem = sessionData[i];
            var sessionDataItemName = sessionDataItem.name;
            var sessionDataItemValue = sessionDataItem.value;
            if (sessionDataItemName && sessionDataItemValue) {
                sessionDataItem.value = sessionStorage.getItem(sessionDataItemName);
            }
        }
    }
    return session;
}
export default { setStorageSessions, getStorageSessions };