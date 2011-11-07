// Unity 画面に対する WebView の組み込みと、メッセージのやりとりを担当するクラス。

package jp.radiumsoftware.unity.plugin.webmediator;

import com.unity3d.player.UnityPlayer;

import java.util.concurrent.SynchronousQueue;
import java.lang.InterruptedException;

import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;

public class WebViewInjector {
    // 組み込まれる WebView
    private static WebView webView;

    // WebView からのメッセージを保持するキュー
    private static SynchronousQueue<String> messageQueue;

    // WebView の組み込み
    public static void install(final String url) {
        // キューの初期化。
        messageQueue = new SynchronousQueue<String>();
        // WebView の組み込みは UI スレッド内で行う。
        UnityPlayer.currentActivity.runOnUiThread(new Runnable() {
            public void run() {
                if (webView != null) return;
                // ウェブビューを作る。
                webView = new WebView(UnityPlayer.currentActivity);
                // 単純な縦レイアウトを使う。
                LinearLayout layout = new LinearLayout(UnityPlayer.currentActivity);
                layout.setOrientation(LinearLayout.VERTICAL);
                layout.setGravity(Gravity.TOP);
                UnityPlayer.currentActivity.addContentView(layout, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
                // 上半分に空ビュー、下半分にウェブビューを埋め込む。
                LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT, 0.5f);
                layout.addView(new View(UnityPlayer.currentActivity), params);
                layout.addView(webView, params);
                // 埋め込みウェブビューの動作を設定する。
                WebSettings webSettings = webView.getSettings();
                webSettings.setSavePassword(false);
                webSettings.setSaveFormData(false);
                webSettings.setJavaScriptEnabled(true);
                webSettings.setSupportZoom(false);
                // URL コールバックを組み込む。
                webView.setWebViewClient(new WebViewClient() {
                    @Override  
                    public boolean shouldOverrideUrlLoading(WebView view, String url)  {  
                        // URL スキームが "unity:" であるかどうか。
                        if (url.substring(0, 6).equals("unity:")) {
                            // "unity://callback" までを削除。
                            String body = url.substring(16);
                            Log.d("WebViewClient", body);
                            // キューに追加。
                            try{
                                messageQueue.put(body);
                            } catch (java.lang.InterruptedException e) {
                                Log.d("WebViewClient", "Queueing error - " + e.getMessage());
                            }
                            return true;
                        } else {
                            // 普通にロードする。
                            return false;
                        }
                    }  
                });
                // 埋め込みページのロード。
                webView.loadUrl(url);
            }
        });
    }

    // メッセージの取得。
    public static String pollMessage() {
        return messageQueue.poll();
    }
}
