package jp.oneofthem.supplementwebview;

import jp.radiumsoftware.unitywebviewexample.ExtendedUnityPlayerActivity;
import android.content.Intent;
import android.util.Log;

import com.unity3d.player.UnityPlayer;

public class SupplementWebview {
	public static void startWebview(){
		if(!"ExtendedUnityPlayerActivity".equalsIgnoreCase(UnityPlayer.currentActivity.getClass().getSimpleName())){
			UnityPlayer.currentActivity.startActivity(new Intent(UnityPlayer.currentActivity, ExtendedUnityPlayerActivity.class));
		}
		return;
	}
}
