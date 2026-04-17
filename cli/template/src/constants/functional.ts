import { Dimensions } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import Config from 'react-native-config';

const storage = createMMKV({
  id: 'app-storage',
  encryptionKey: Config.ENCRYPTION_KEY,
  encryptionType: 'AES-256',
  mode: 'multi-process',
  readOnly: false,
});

const handlerGetItem = (params: string) => {
  try {
    return storage.getString(params);
  } catch (error) {
    console.error('Failed to get item:', params, error);
  }
};

const handlerGetAndParseJSON = <T>(key: string): T | null => {
  try {
    const item = storage.getString(key);

    if (item) {
      return JSON.parse(item) as T;
    }
    return null;
  } catch (error) {
    console.error(`Failed to parse JSON from storage for key "${key}":`, error);
    return null;
  }
};

const handlerSetItem = async (key: string, value: string) => {
  try {
    await storage.set(key, value);
  } catch (error) {
    console.error('Failed to set item:', key, error);
  }
};

const handlerRemoveItem = async (key: string) => {
  try {
    await storage.remove(key);
  } catch (error) {
    console.error('Failed to remove item:', key, error);
  }
};

const handlerClearItem = async () => {
  try {
    await storage.clearAll();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export {
  screenWidth,
  screenHeight,
  windowWidth,
  windowHeight,
  handlerGetItem,
  handlerGetAndParseJSON,
  handlerSetItem,
  handlerRemoveItem,
  handlerClearItem,
};
