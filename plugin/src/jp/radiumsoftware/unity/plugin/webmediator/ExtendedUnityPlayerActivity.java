// WebView 組み込み用に拡張した UnityPlayerActivity クラス。

package jp.radiumsoftware.unity.plugin.webmediator;

import com.unity3d.player.UnityPlayerActivity;

import java.util.concurrent.SynchronousQueue;
import java.lang.InterruptedException;

import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;

public class ExtendedUnityPlayerActivity extends UnityPlayerActivity {
    private WebView webView;
    private boolean initialLoaded;

    // WebView からのメッセージを保持するキュー
    private SynchronousQueue<String> messageQueue;

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // キューの初期化。
        messageQueue = new SynchronousQueue<String>();
        // WebView の組み込み。
        installWebView();
    }

    // 状態の更新
    public void update(final String lastRequestedUrl, boolean loadRequest) {
        if (loadRequest || !initialLoaded) {
            // 指定ページのロード（UIスレッドで実行）。
            runOnUiThread(new Runnable() {
                public void run() {
                    webView.loadUrl(lastRequestedUrl);
                }
            });
            initialLoaded = true;
        }
    }

    // メッセージの取得
    public String pollMessage() {
        if (messageQueue != null) {
            return messageQueue.poll();
        } else {
            return null;
        }
    }

    // WebView の組み込み
    private void installWebView() {
        // ウェブビューを作る。
        webView = new WebView(this);
        // 単純な縦レイアウトを使う。
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.TOP);
        addContentView(layout, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        // 上半分に空ビュー、下半分にウェブビューを埋め込む。
        LayoutParams params = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT, 0.5f);
        layout.addView(new View(this), params);
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
    }
} 
