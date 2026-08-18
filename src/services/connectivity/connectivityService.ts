import NetInfo from '@react-native-community/netinfo';

export type ConnectivityListener = (online: boolean) => void;

const isOnline = (state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}): boolean =>
  state.isConnected === true && state.isInternetReachable !== false;

export const subscribeToConnectivity = (
  listener: ConnectivityListener,
): (() => void) =>
  NetInfo.addEventListener(state => listener(isOnline(state)));

export const getIsOnline = async (): Promise<boolean> =>
  isOnline(await NetInfo.fetch());
