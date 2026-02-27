import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { GAME_HTML } from './src/generatedGameHtml';

const GAME_SOURCE = { html: GAME_HTML, baseUrl: 'https://neonhoopz.local/' };

export default function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [errorText, setErrorText] = useState('');
  const source = useMemo(() => GAME_SOURCE, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.webWrap}>
        <WebView
          key={reloadKey}
          source={source}
          onLoad={() => setErrorText('')}
          onError={() => setErrorText('Game load failed. Tap Reload to retry.')}
          onHttpError={() => setErrorText('Game load failed. Tap Reload to retry.')}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          style={styles.webview}
        />
        {errorText ? (
          <View style={styles.errorBar}>
            <Text style={styles.errorText}>{errorText}</Text>
            <Pressable style={styles.reloadBtn} onPress={() => setReloadKey((v) => v + 1)}>
              <Text style={styles.reloadText}>Reload</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#03101c',
  },
  webWrap: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(7, 20, 32, 0.92)',
    borderColor: '#15506f',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  errorText: {
    color: '#f6a39a',
    fontSize: 12,
    flex: 1,
  },
  reloadBtn: {
    borderWidth: 1,
    borderColor: '#2fc8ff',
    borderRadius: 8,
    backgroundColor: '#0a2d42',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reloadText: {
    color: '#c7eeff',
    fontSize: 12,
    fontWeight: '700',
  },
});
