// WebView を Unity に埋め込む処理を担当するクラス。

package jp.radiumsoftware.unity.plugin.webmediator;

import com.unity3d.player.UnityPlayer;

import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;

public class WebViewInjector {
    private static WebView webView;
    private static JavaScriptInterface jsif;

    public static void install(final String url) {
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
                // JavaScript インタフェースを組み込む。
                webView.setWebChromeClient(new WebChromeClient());
                jsif = new JavaScriptInterface();
                webView.addJavascriptInterface(jsif, "mediator");
                // 埋め込みページのロード。
                webView.loadUrl(url);
            }
        });
    }
}
