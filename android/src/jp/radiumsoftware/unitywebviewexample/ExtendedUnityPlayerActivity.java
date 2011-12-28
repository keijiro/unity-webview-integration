// UnityPlayerActivity and WebView integration

package jp.radiumsoftware.unitywebviewexample;

import com.unity3d.player.UnityPlayerActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.lang.InterruptedException;
import java.util.concurrent.SynchronousQueue;

public class ExtendedUnityPlayerActivity extends UnityPlayerActivity {

    // JavaScript interface class for embedded WebView.
    private class JSInterface {
        public SynchronousQueue<String> mMessageQueue;

        JSInterface() {
            mMessageQueue = new SynchronousQueue<String>();
        }

        public void pushMessage(String message) {
            Log.d("WebView", message);
            try {
                mMessageQueue.put(message);
            } catch (java.lang.InterruptedException e) {
                Log.d("WebView", "Queueing error - " + e.getMessage());
            }
        }
    }

    private JSInterface mJSInterface;   // JavaScript interface (message receiver)
    private WebView mWebView;           // WebView object
    private int mLeftMargin;            // Margins around the WebView
    private int mTopMargin;
    private int mRightMargin;
    private int mBottomMargin;
    private boolean mInitialLoad;       // Initial load flag

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Create a WebView and make layout.
        mWebView = new WebView(this);
        FrameLayout layout = new FrameLayout(this);
        addContentView(layout, new LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
        layout.addView(mWebView, new FrameLayout.LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, Gravity.NO_GRAVITY));
        // Basic settings of WebView.
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setSupportZoom(false);
        webSettings.setJavaScriptEnabled(true);
        webSettings.setPluginsEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        // Set a dummy WebViewClient (which enables loading a new page in own WebView).
        mWebView.setWebViewClient(new WebViewClient(){});
        // Create a JavaScript interface and bind the WebView to it.
        mJSInterface = new JSInterface();
        mWebView.addJavascriptInterface(mJSInterface, "UnityInterface");
        // Start in invisible state.
        mWebView.setVisibility(View.GONE);
    }

    public void updateWebView(final String lastRequestedUrl, final boolean loadRequest, final boolean visibility, final int leftMargin, final int topMargin, final int rightMargin, final int bottomMargin) {
        // Process load requests.
        if (lastRequestedUrl != null && (loadRequest || !mInitialLoad)) {
            runOnUiThread(new Runnable() {
                public void run() {
                    mWebView.loadUrl(lastRequestedUrl);
                }
            });
            mInitialLoad = true;
        }
        // Process changes in margin amounts.
        if (leftMargin != mLeftMargin || topMargin != mTopMargin || rightMargin != mRightMargin || bottomMargin != mBottomMargin) {
            mLeftMargin = leftMargin;
            mTopMargin = topMargin;
            mRightMargin = rightMargin;
            mBottomMargin = bottomMargin;
            runOnUiThread(new Runnable() {
                public void run() {
                    // Apply a new layout to the WebView.
                    FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, Gravity.NO_GRAVITY);
                    params.setMargins(mLeftMargin, mTopMargin, mRightMargin, mBottomMargin);
                    mWebView.setLayoutParams(params);
                }
            });
        }
        // Process changes in visibility.
        if (visibility != (mWebView.getVisibility() == View.VISIBLE)) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (visibility) {
                        // Show and set focus.
                        mWebView.setVisibility(View.VISIBLE);
                        mWebView.requestFocus();
                    } else {
                        // Hide.
                        mWebView.setVisibility(View.GONE);
                    }
                }
            });
        }
    }

    public String pollWebViewMessage() {
        return mJSInterface.mMessageQueue.poll();
    }
} 
