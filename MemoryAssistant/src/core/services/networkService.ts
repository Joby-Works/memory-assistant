import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown';

export interface NetworkStatus {
  isConnected: boolean;
  type: ConnectionType;
  isWifi: boolean;
  isCellular: boolean;
}

export class NetworkService {
  private lastStatus: NetworkStatus = {
    isConnected: false,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  };

  async getNetworkStatus(): Promise<NetworkStatus> {
    const state: NetInfoState = await NetInfo.fetch();

    this.lastStatus = {
      isConnected: state.isConnected ?? false,
      type: this.mapConnectionType(state.type),
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    };

    return this.lastStatus;
  }

  private mapConnectionType(type: string): ConnectionType {
    switch (type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'cellular';
      case 'none':
        return 'none';
      default:
        return 'unknown';
    }
  }

  isOnWifi(): boolean {
    return this.lastStatus.isWifi;
  }

  isOnCellular(): boolean {
    return this.lastStatus.isCellular;
  }

  isConnected(): boolean {
    return this.lastStatus.isConnected;
  }
}

export const networkService = new NetworkService();
