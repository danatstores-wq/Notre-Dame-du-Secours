import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, BackHandler, Linking, Platform, Pressable, SafeAreaView,
  StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const WEBSITE_URL = 'https://danatstores-wq.github.io/Notre-Dame-du-Secours/';
const ANDROID_BUNDLED_SITE = 'file:///android_asset/site/index.html';
const BACKGROUND = '#101a31';
const GOLD = '#c8a96a';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const goBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [goBack]);

  const handleNavigation = useCallback((request) => {
    const url = request.url || '';
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    return true;
  }, []);

  const sharePhoto = async (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !/(^|\.)imagekit\.io$/.test(parsed.hostname)) {
        throw new Error('Invalid photo URL');
      }
      const ext = (parsed.pathname.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || 'jpg').toLowerCase();
      const fileUri = `${FileSystem.cacheDirectory}parish-photo-${Date.now()}.${ext}`;
      const download = await FileSystem.downloadAsync(url, fileUri);
      if (!download?.uri || !(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }
      await Sharing.shareAsync(download.uri, { mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, dialogTitle: 'Share parish photo' });
    } catch (error) {
      console.warn('Photo sharing failed:', error?.message || error);
    }
  };

  const retry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const source = Platform.OS === 'android'
    ? { uri: ANDROID_BUNDLED_SITE }
    : { uri: WEBSITE_URL };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={source}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          allowFileAccess={Platform.OS === 'android'}
          allowFileAccessFromFileURLs={Platform.OS === 'android'}
          allowUniversalAccessFromFileURLs={Platform.OS === 'android'}
          mixedContentMode="always"
          cacheEnabled
          onShouldStartLoadWithRequest={handleNavigation}
          onMessage={(event) => {
            try {
              const message = JSON.parse(event.nativeEvent.data || '{}');
              if (message.type === 'SHARE_PARISH_PHOTO' && typeof message.url === 'string') sharePhoto(message.url);
            } catch (error) { console.warn('Invalid WebView share message'); }
          }}
          onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
          onLoadStart={() => { setHasError(false); setIsLoading(true); }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          onContentProcessDidTerminate={retry}
          pullToRefreshEnabled
          startInLoadingState={false}
          renderLoading={() => null}
        />
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={GOLD} />
          </View>
        )}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>Unable to load the parish app</Text>
            <Text style={styles.errorMessage}>Please check your internet connection and try again.</Text>
            <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1, backgroundColor: BACKGROUND },
  webView: { flex: 1, backgroundColor: BACKGROUND },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center',
    justifyContent: 'center', backgroundColor: BACKGROUND,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 28, backgroundColor: BACKGROUND,
  },
  errorTitle: {
    color: '#ffffff', fontSize: 19, fontWeight: '600',
    textAlign: 'center', marginBottom: 10,
  },
  errorMessage: {
    color: '#d6d9e0', fontSize: 15, lineHeight: 22,
    textAlign: 'center', marginBottom: 22,
  },
  retryButton: {
    minWidth: 132, alignItems: 'center', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 8, backgroundColor: GOLD,
  },
  retryText: { color: '#101a31', fontSize: 15, fontWeight: '700' },
});
