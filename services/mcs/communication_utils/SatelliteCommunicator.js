import { logger } from "observability";
class SatelliteCommunicator {
  constructor(communicationWindow, waitWindow) {
    this.canCommunicate = false;
    this.communicationWindow = communicationWindow; // Time in ms you can communicate
    this.waitWindow = waitWindow; // Time in ms you have to wait until you can communicate again
    this.initiateCommunicationCycle();
  }

  initiateCommunicationCycle() {
    this.canCommunicate = true;
    setTimeout(() => {
      this.canCommunicate = false;
      // After the communication window closes, wait for the wait window before allowing communication again
      setTimeout(() => {
        this.initiateCommunicationCycle();
      }, this.waitWindow);
    }, this.communicationWindow);
  }

  tryCommunicate() {
    if (this.canCommunicate) {
      return true;
    } else {
      return false;
    }
  }
}

export default SatelliteCommunicator;
