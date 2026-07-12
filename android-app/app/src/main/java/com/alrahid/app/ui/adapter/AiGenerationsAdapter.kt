package com.alrahid.app.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.alrahid.app.R
import com.alrahid.app.data.model.AiGeneration

class AiGenerationsAdapter : RecyclerView.Adapter<AiGenerationsAdapter.VH>() {

    private val items = mutableListOf<AiGeneration>()

    fun submit(list: List<AiGeneration>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvType: TextView = itemView.findViewById(R.id.tvGenType)
        val tvModel: TextView = itemView.findViewById(R.id.tvGenModel)
        val tvCredits: TextView = itemView.findViewById(R.id.tvGenCredits)
        val tvStatus: TextView = itemView.findViewById(R.id.tvGenStatus)
        val tvDate: TextView = itemView.findViewById(R.id.tvGenDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_ai_generation, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        holder.tvType.text = item.type?.replaceFirstChar { it.uppercase() } ?: "AI"
        holder.tvModel.text = item.model ?: "-"
        holder.tvCredits.text = "${item.creditsUsed} credits"
        holder.tvStatus.text = item.status ?: "completed"
        holder.tvDate.text = item.createdAt ?: ""
    }

    override fun getItemCount(): Int = items.size
}
