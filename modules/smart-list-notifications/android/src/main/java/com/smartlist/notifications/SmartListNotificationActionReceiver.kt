package com.smartlist.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.NotificationManager

class SmartListNotificationActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.cancel(SmartListNotificationsModule.NOTIFICATION_ID)

    if (intent.action != SmartListNotificationsModule.ACTION_SNOOZE) {
      return
    }

    context.getSharedPreferences(
      SmartListNotificationsModule.PREFERENCES_NAME,
      Context.MODE_PRIVATE
    ).edit().putString(SmartListNotificationsModule.PENDING_ACTION_KEY, "snooze").commit()
    context.sendBroadcast(
      Intent(SmartListNotificationsModule.ACTION_APP_NOTIFICATION_ACTION)
        .setPackage(context.packageName)
        .putExtra("action", "snooze")
    )

    val activityClass = Class.forName("${context.packageName}.MainActivity")
    val launchIntent = Intent(context, activityClass).apply {
      action = SmartListNotificationsModule.ACTION_SNOOZE
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    context.startActivity(launchIntent)
  }
}
