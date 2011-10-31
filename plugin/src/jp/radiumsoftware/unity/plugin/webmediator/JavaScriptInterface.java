// ウェブビュー内 JavaScript との仲介役クラス。

package jp.radiumsoftware.unity.plugin.webmediator;

import android.util.Log;
import java.util.Stack;

public class JavaScriptInterface {
    private Stack<String> messageBuffer;

    JavaScriptInterface() {
        messageBuffer = new Stack<String>();
    }

    public void pushMessage(String message) {
        messageBuffer.push(message);
        Log.d("mediator", message);
    }

    public String popMessage() {
        if (messageBuffer.empty()) {
            return null;
        } else {
            return messageBuffer.pop();
        }
    }
}
