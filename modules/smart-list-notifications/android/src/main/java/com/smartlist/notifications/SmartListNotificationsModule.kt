package com.smartlist.notifications

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.os.Build
import android.widget.RemoteViews
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Conecta o aplicativo React Native às notificações personalizadas do Android. */
class SmartListNotificationsModule : Module() {
  private var actionReceiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("SmartListNotifications")
    Events(EVENT_NOTIFICATION_ACTION)

    OnStartObserving {
      val context = appContext.reactContext ?: return@OnStartObserving
      val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
          val action = intent.getStringExtra("action") ?: return
          sendEvent(EVENT_NOTIFICATION_ACTION, mapOf("action" to action))
        }
      }
      actionReceiver = receiver
      val filter = IntentFilter(ACTION_APP_NOTIFICATION_ACTION)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        @Suppress("DEPRECATION")
        context.registerReceiver(receiver, filter)
      }
    }

    OnStopObserving {
      val context = appContext.reactContext
      val receiver = actionReceiver
      if (context != null && receiver != null) {
        context.unregisterReceiver(receiver)
      }
      actionReceiver = null
    }

    AsyncFunction("presentDepartureNotification") { items: List<Map<String, Any?>> ->
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("O contexto Android não está disponível.")
      presentDepartureNotification(context, items)
    }

    AsyncFunction<String?>("consumePendingAction") {
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("O contexto Android não está disponível.")
      val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
      val action = preferences.getString(PENDING_ACTION_KEY, null)
      preferences.edit().remove(PENDING_ACTION_KEY).commit()
      action
    }
  }

  private fun presentDepartureNotification(context: Context, items: List<Map<String, Any?>>) {
    if (items.isEmpty()) {
      throw IllegalArgumentException("Não há itens pendentes para exibir na notificação.")
    }

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    createNotificationChannel(manager)

    val pendingNames = items.mapNotNull { item -> item["name"] as? String }
    val count = pendingNames.size
    val itemSummary = summarizeItems(pendingNames)
    val title = "Você saiu de casa com compras pendentes!"
    val body = "Há $count ${if (count == 1) "item" else "itens"} na sua lista: $itemSummary."

    val compact = RemoteViews(context.packageName, R.layout.smart_list_notification_compact)
    compact.setTextViewText(R.id.notification_title, title)
    compact.setTextViewText(R.id.notification_body, body)

    val expanded = RemoteViews(context.packageName, R.layout.smart_list_notification_expanded)
    expanded.setTextViewText(R.id.notification_title, title)
    expanded.setTextViewText(R.id.notification_body, body)
    expanded.setTextViewText(
      R.id.notification_distance,
      "Afastamento detectado • raio residencial de 150 m"
    )
    bindItemPreview(expanded, pendingNames, items)

    val openIntent = createOpenIntent(context)
    val openPendingIntent = PendingIntent.getActivity(
      context,
      NOTIFICATION_ID,
      openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
    val snoozePendingIntent = createActionPendingIntent(context, ACTION_SNOOZE, REQUEST_CODE_SNOOZE)
    val dismissPendingIntent = createActionPendingIntent(context, ACTION_DISMISS, REQUEST_CODE_DISMISS)

    expanded.setOnClickPendingIntent(R.id.action_open_list, openPendingIntent)
    expanded.setOnClickPendingIntent(R.id.action_snooze, snoozePendingIntent)
    expanded.setOnClickPendingIntent(R.id.action_dismiss, dismissPendingIntent)

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(context, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(context)
    }
    val notification = builder
      .setSmallIcon(R.drawable.smart_list_notification_icon)
      .setColor(Color.rgb(0, 107, 50))
      .setPriority(Notification.PRIORITY_HIGH)
      .setCategory(Notification.CATEGORY_REMINDER)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setAutoCancel(true)
      .setContentTitle(title)
      .setContentText(body)
      .setContentIntent(openPendingIntent)
      .setCustomContentView(compact)
      .setCustomBigContentView(expanded)
      .setStyle(Notification.DecoratedCustomViewStyle())
      .build()

    manager.notify(NOTIFICATION_ID, notification)
  }

  private fun bindItemPreview(
    view: RemoteViews,
    names: List<String>,
    items: List<Map<String, Any?>>
  ) {
    val tileIds = listOf(
      Triple(R.id.item_1, R.id.item_1_icon, R.id.item_1_name),
      Triple(R.id.item_2, R.id.item_2_icon, R.id.item_2_name),
      Triple(R.id.item_3, R.id.item_3_icon, R.id.item_3_name)
    )
    val visibleItems = minOf(names.size, tileIds.size)

    tileIds.forEachIndexed { index, (tileId, iconId, nameId) ->
      if (index < visibleItems) {
        val item = items[index]
        view.setViewVisibility(tileId, android.view.View.VISIBLE)
        view.setTextViewText(iconId, categoryIcon(item["category"] as? String))
        view.setTextViewText(nameId, names[index].take(MAX_ITEM_NAME_LENGTH))
      } else {
        view.setViewVisibility(tileId, android.view.View.GONE)
      }
    }

    val overflow = names.size - visibleItems
    view.setViewVisibility(
      R.id.item_overflow,
      if (overflow > 0) android.view.View.VISIBLE else android.view.View.GONE
    )
    if (overflow > 0) {
      view.setTextViewText(R.id.item_overflow_count, "+$overflow")
      view.setTextViewText(R.id.item_overflow_label, if (overflow == 1) "item" else "itens")
    }
  }

  private fun createNotificationChannel(manager: NotificationManager) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Lembretes da Smart List",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Lembretes de compras ao sair da residência"
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 250, 180, 250)
      }
      manager.createNotificationChannel(channel)
    }
  }

  private fun createOpenIntent(context: Context): Intent {
    val activityClass = Class.forName("${context.packageName}.MainActivity")
    return Intent(context, activityClass).apply {
      action = ACTION_OPEN_LIST
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
  }

  private fun createActionPendingIntent(context: Context, action: String, requestCode: Int): PendingIntent {
    val intent = Intent(context, SmartListNotificationActionReceiver::class.java).apply {
      this.action = action
    }
    return PendingIntent.getBroadcast(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun summarizeItems(names: List<String>): String {
    val firstNames = names.take(3).joinToString(", ")
    val remaining = names.size - minOf(names.size, 3)
    return if (remaining > 0) "$firstNames e mais $remaining ${if (remaining == 1) "produto" else "produtos"}"
    else firstNames
  }

  private fun categoryIcon(category: String?): String = when (category?.uppercase()) {
    "PADARIA" -> "🍞"
    "LATICINIOS", "LATICÍNIOS" -> "🥛"
    "OLEOS_CONDIMENTOS", "ÓLEOS E CONDIMENTOS" -> "🫒"
    "HORTIFRUTI", "HORTIFRÚTI" -> "🥬"
    "LIMPEZA" -> "🧴"
    "HIGIENE_PESSOAL", "HIGIENE PESSOAL" -> "🧼"
    "FARMACIA", "FARMÁCIA" -> "💊"
    "PAPELARIA" -> "✏️"
    "MERCEARIA", "MERCADO" -> "🛒"
    else -> "🛍️"
  }

  companion object {
    const val CHANNEL_ID = "smart-list-reminders"
    const val NOTIFICATION_ID = 5801
    const val ACTION_OPEN_LIST = "com.smartlist.notifications.OPEN_LIST"
    const val ACTION_SNOOZE = "com.smartlist.notifications.SNOOZE"
    const val ACTION_DISMISS = "com.smartlist.notifications.DISMISS"
    const val ACTION_APP_NOTIFICATION_ACTION = "com.smartlist.notifications.ACTION"
    const val EVENT_NOTIFICATION_ACTION = "onNotificationAction"
    const val PREFERENCES_NAME = "smart_list_notification_actions"
    const val PENDING_ACTION_KEY = "pending_action"
    private const val REQUEST_CODE_SNOOZE = 5802
    private const val REQUEST_CODE_DISMISS = 5803
    private const val MAX_ITEM_NAME_LENGTH = 16
  }
}
