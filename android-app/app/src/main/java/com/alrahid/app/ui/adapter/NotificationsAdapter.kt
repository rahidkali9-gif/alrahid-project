package com.alrahid.app.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.alrahid.app.R
import com.alrahid.app.data.model.Notification

class NotificationsAdapter(
    private val onClick: (String) -> Unit = {}
) : RecyclerView.Adapter<NotificationsAdapter.VH>() {

    private val items = mutableListOf<Notification>()

    fun submit(list: List<Notification>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    inner class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvTitle: TextView = itemView.findViewById(R.id.tvNotifTitle)
        val tvMessage: TextView = itemView.findViewById(R.id.tvNotifMessage)
        val tvDate: TextView = itemView.findViewById(R.id.tvNotifDate)
        val dotUnread: View = itemView.findViewById(R.id.dotUnread)

        init {
            itemView.setOnClickListener {
                val item = items[bindingAdapterPosition]
                if (!item.read) onClick(item.id)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        holder.tvTitle.text = item.title ?: "Notification"
        holder.tvMessage.text = item.message ?: ""
        holder.tvDate.text = item.createdAt ?: ""
        holder.dotUnread.visibility = if (item.read) View.GONE else View.VISIBLE
    }

    override fun getItemCount(): Int = items.size
}
