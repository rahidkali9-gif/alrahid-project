package com.alrahid.app.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.alrahid.app.R
import com.alrahid.app.data.model.ActivityLog

/**
 * Adapter for the account activity log shown on the History screen.
 * Reuses [R.layout.item_notification] since each row is a title + subtitle +
 * date triple, which fits an activity entry well.
 */
class ActivityAdapter : RecyclerView.Adapter<ActivityAdapter.VH>() {

    private val items = mutableListOf<ActivityLog>()

    fun submit(list: List<ActivityLog>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvTitle: TextView = itemView.findViewById(R.id.tvNotifTitle)
        val tvMessage: TextView = itemView.findViewById(R.id.tvNotifMessage)
        val tvDate: TextView = itemView.findViewById(R.id.tvNotifDate)
        val dotUnread: View = itemView.findViewById(R.id.dotUnread)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        holder.tvTitle.text = item.action ?: "Activity"
        holder.tvMessage.text = item.description ?: ""
        holder.tvDate.text = item.createdAt ?: ""
        holder.dotUnread.visibility = View.GONE
    }

    override fun getItemCount(): Int = items.size
}
