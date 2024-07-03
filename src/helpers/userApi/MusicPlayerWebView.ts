import { INTERNAL_API_KEY } from '@/constants/constant';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

// Adjust the type of MusicInfo according to your actual type definition
interface MusicInfo {
  // define the MusicInfo properties here
}

interface MusicPlayerWebViewProps {
  onMusicUrlReceived: (url: string) => void;
}

interface MusicPlayerWebViewHandle {
  requestMusicUrl: (source: string, musicInfo: MusicInfo, quality: string) => void;
}
interface MyWebView extends WebView, MusicPlayerWebViewHandle {}
const MusicPlayerWebView = forwardRef<MusicPlayerWebViewHandle, MusicPlayerWebViewProps>((props, ref) => {
  const webviewRef = useRef<MyWebView>(null);
  const handleRef = useRef<MusicPlayerWebViewHandle | null>(null);

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.event === 'inited') {
      console.log('Script initialized successfully:', data.status);
    } else if (data.event === 'musicUrl') {
      props.onMusicUrlReceived(data.url);
    }
  };

  useImperativeHandle(ref, () => ({
    requestMusicUrl: (source: string, musicInfo: MusicInfo, quality: string) => {
      if (webviewRef.current) {
        const message = {
          action: 'musicUrl',
          source,
          info: {
            type: quality,
            musicInfo
          }
        };
        webviewRef.current.postMessage(JSON.stringify(message));
      }
    }
  }));

  useEffect(() => {
    const initializeScript = () => {
      const script = `
        ${INTERNAL_API_KEY}

        // 向 LX Music 发送初始化成功事件
        send(EVENT_NAMES.inited, { status: true, openDevTools: DEV_ENABLE, sources: musicSources });
      `;
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(script);
      }
    };

    initializeScript();
  }, []);//的作用就是指定一个副效应函数，组件每渲染一次，该函数就自动执行一次(依赖为空)。组件首次在网页 DOM 加载后，副效应函数也会执行。

 return (
    <WebView
      ref={webviewRef}
      originWhitelist={['*']}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      cacheEnabled={true}
      domStorageEnabled={true}
      source={{ html: '<html><body></body></html>' }} // 加载空的HTML文件
      onLoadEnd={() => {
        const script = `
          send(EVENT_NAMES.inited, { status: true, openDevTools: DEV_ENABLE, sources: musicSources });
        `;
        if (webviewRef.current) {
          webviewRef.current.injectJavaScript(script);
        }
      }}
    />
  );
});


export default MusicPlayerWebView;
