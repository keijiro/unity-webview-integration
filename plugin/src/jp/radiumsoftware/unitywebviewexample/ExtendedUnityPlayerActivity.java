// WebView 組み込み用に拡張した UnityPlayerActivity クラス。

package jp.radiumsoftware.unitywebviewexample;

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
import android.widget.FrameLayout;

public class ExtendedUnityPlayerActivity extends UnityPlayerActivity {

    // JavaScript interface class for embedded WebView.
    private class JavaScriptInterface {
        public SynchronousQueue<String> mMessageQueue;

        JavaScriptInterface() {
            mMessageQueue = new SynchronousQueue<String>();
        }

        public void pushMessage(String message) {
            try {
                mMessageQueue.put(message);
            } catch (java.lang.InterruptedException e) {
                Log.d("WebViewClient", "Queueing error - " + e.getMessage());
            }
        }
    }

    private JavaScriptInterface mJavaScriptInterface;

    // 組み込まれる WebView の実体
    private WebView mWebView;

    // WebView 周辺のマージン量
    private int mLeftMargin, mTopMargin, mRightMargin, mBottomMargin;

    // 最初のページ読み込みが行われたかどうか
    private boolean mInitialLoad;

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // WebView の組み込み。
        installWebView();
    }

    // フレーム更新時に実行する処理
    public void updateWebView(final String lastRequestedUrl, final boolean loadRequest, final boolean visibility, final int leftMargin, final int topMargin, final int rightMargin, final int bottomMargin) {
        // ロード要求の処理。
        if (lastRequestedUrl != null && (loadRequest || !mInitialLoad)) {
            runOnUiThread(new Runnable() {
                public void run() {
                    mWebView.loadUrl(lastRequestedUrl);
                }
            });
            mInitialLoad = true;
        }
        // マージン幅の処理。
        if (leftMargin != mLeftMargin || topMargin != mTopMargin || rightMargin != mRightMargin || bottomMargin != mBottomMargin) {
            mLeftMargin = leftMargin;
            mTopMargin = topMargin;
            mRightMargin = rightMargin;
            mBottomMargin = bottomMargin;
            runOnUiThread(new Runnable() {
                public void run() {
                    FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.FILL_PARENT, FrameLayout.LayoutParams.FILL_PARENT, Gravity.NO_GRAVITY);
                    params.setMargins(mLeftMargin, mTopMargin, mRightMargin, mBottomMargin);
                    mWebView.setLayoutParams(params);
                }
            });
        }
        // 表示状態の処理。
        if (visibility != (mWebView.getVisibility() == View.VISIBLE)) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (visibility) {
                        mWebView.setVisibility(View.VISIBLE);
                        mWebView.requestFocus();
                    } else {
                        mWebView.setVisibility(View.GONE);
                    }
                }
            });
        }
    }

    // メッセージの取得
    public String pollWebViewMessage() {
        return mJavaScriptInterface.mMessageQueue.poll();
    }

    // WebView の組み込み
    private void installWebView() {
        // FrameLayout の構築。
        FrameLayout layout = new FrameLayout(this);
        addContentView(layout, new LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
        // WebView の作成。
        mWebView = new WebView(this);
        layout.addView(mWebView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.FILL_PARENT, FrameLayout.LayoutParams.FILL_PARENT, Gravity.NO_GRAVITY));
        // WebView の設定。
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setSupportZoom(false);
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webSettings.setPluginsEnabled(true);
        // Set a dummy WebViewClient (which enables load new pages in WebView).
        mWebView.setWebViewClient(new WebViewClient(){});
        // Create a JavaScript interface and bind the WebView to it.
        mJavaScriptInterface = new JavaScriptInterface();
        mWebView.addJavascriptInterface(mJavaScriptInterface, "UnityInterface");
        // 最初は非表示状態にしておく。
        mWebView.setVisibility(View.GONE);

        Log.d("WebMediator", "installed");
    }
} 
