
class TDevice {
  constructor(widget_name, clientId, subTopic, pubTopic, selectedKey, historial) {
    this.widget_name = widget_name;
    this.clientId = clientId;
    this.subTopic = subTopic;
    this.pubTopic = pubTopic;
    this.temperature = '';
    this.selectedKey = selectedKey;
    this.tipo = 'temperature';
    this.historial = [historial];
  }
}


export default TDevice;
