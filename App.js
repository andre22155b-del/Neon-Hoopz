import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { GAME_HTML } from './src/generatedGameHtml';

const REMOTE_GAME_URL = 'https://andre22155b-del.github.io/Neon-Hoopz/';
const EMBEDDED_GAME_SOURCE = { html: GAME_HTML, baseUrl: 'https://neonhoopz.local/' };
const WEBVIEW_BRIDGE = `
  (function () {
    var post = function (type, payload) {
      try {
        if (!window.ReactNativeWebView || !window.ReactNativeWebView.postMessage) return;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          payload: payload || {}
        }));
      } catch (_) {}
    };
    window.addEventListener('error', function (e) {
      post('runtime_error', {
        message: e && e.message ? e.message : 'Unknown script error',
        source: e && e.filename ? e.filename : '',
        line: e && e.lineno ? e.lineno : 0,
        col: e && e.colno ? e.colno : 0
      });
    });
    window.addEventListener('unhandledrejection', function (e) {
      var reason = e && e.reason && e.reason.message ? e.reason.message : String((e && e.reason) || 'Unhandled promise rejection');
      post('runtime_error', { message: reason });
    });
    document.addEventListener('DOMContentLoaded', function () {
      post('dom_ready', { href: location.href });
    });
    setTimeout(function () {
      post('boot_ping', { href: location.href });
    }, 1200);
    true;
  })();
`;

export default function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sourceMode, setSourceMode] = useState('remote');
  const source = useMemo(() => {
    if (sourceMode === 'remote') {
      const sep = REMOTE_GAME_URL.includes('?') ? '&' : '?';
      return { uri: `${REMOTE_GAME_URL}${sep}from=expo&t=${reloadKey}` };
    }
    return EMBEDDED_GAME_SOURCE;
  }, [reloadKey, sourceMode]);

  const reload = () => {
    setErrorText('');
    setLoading(true);
    setReloadKey((v) => v + 1);
  };

  const switchSource = (mode) => {
    setSourceMode(mode);
    setErrorText('');
    setLoading(true);
    setReloadKey((v) => v + 1);
  };

  const handleLoadFailure = (reason) => {
    if (sourceMode === 'remote') {
      setSourceMode('embedded');
      setLoading(true);
      setErrorText(`Remote load failed (${reason}). Switched to embedded build.`);
      setReloadKey((v) => v + 1);
      return;
    }
    setLoading(false);
    setErrorText(`Embedded load failed (${reason}).`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.webWrap}>
        <WebView
          key={reloadKey}
          source={source}
          onLoadStart={() => {
            setLoading(true);
            setErrorText('');
          }}
          onLoad={() => {
            setLoading(false);
            setErrorText('');
          }}
          onError={(e) => {
            const detail = e?.nativeEvent?.description || 'unknown';
            handleLoadFailure(detail);
          }}
          onHttpError={(e) => {
            const detail = `${e?.nativeEvent?.statusCode || 'http'} ${e?.nativeEvent?.description || ''}`.trim();
            handleLoadFailure(detail);
          }}
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data || '{}');
              if (msg.type === 'runtime_error') {
                setLoading(false);
                setErrorText(`Runtime error: ${msg.payload?.message || 'unknown error'}`);
              }
            } catch (_) {}
          }}
          injectedJavaScriptBeforeContentLoaded={WEBVIEW_BRIDGE}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          style={styles.webview}
        />
        <View style={styles.toolbar}>
          <Pressable
            style={[styles.modeBtn, sourceMode === 'remote' ? styles.modeBtnActive : null]}
            onPress={() => switchSource('remote')}
          >
            <Text style={styles.modeText}>Remote</Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, sourceMode === 'embedded' ? styles.modeBtnActive : null]}
            onPress={() => switchSource('embedded')}
          >
            <Text style={styles.modeText}>Embedded</Text>
          </Pressable>
          <Pressable style={[styles.modeBtn, styles.reloadBtn]} onPress={reload}>
            <Text style={styles.modeText}>Reload</Text>
          </Pressable>
        </View>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#2fc8ff" size="small" />
            <Text style={styles.loadingText}>
              {sourceMode === 'remote' ? 'Loading online simulator...' : 'Loading local embedded build...'}
            </Text>
          </View>
        ) : null}
        {errorText ? (
          <View style={styles.errorBar}>
            <Text style={styles.errorText}>{errorText}</Text>
            <Pressable style={styles.reloadActionBtn} onPress={reload}>
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
  toolbar: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    borderWidth: 1,
    borderColor: '#145173',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(3, 20, 33, 0.85)',
  },
  modeBtnActive: {
    borderColor: '#2fc8ff',
    backgroundColor: 'rgba(14, 50, 72, 0.9)',
    shadowColor: '#2fc8ff',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modeText: {
    color: '#c7eeff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 12,
    borderColor: '#175b80',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(4, 17, 28, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#8ecfe7',
    fontSize: 12,
    flex: 1,
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
    marginLeft: 2,
  },
  reloadActionBtn: {
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
