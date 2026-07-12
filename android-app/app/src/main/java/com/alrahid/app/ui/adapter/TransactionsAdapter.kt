package com.alrahid.app.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.alrahid.app.R
import com.alrahid.app.data.model.Transaction

class TransactionsAdapter : RecyclerView.Adapter<TransactionsAdapter.VH>() {

    private val items = mutableListOf<Transaction>()

    fun submit(list: List<Transaction>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvType: TextView = itemView.findViewById(R.id.tvTxnType)
        val tvAmount: TextView = itemView.findViewById(R.id.tvTxnAmount)
        val tvReason: TextView = itemView.findViewById(R.id.tvTxnReason)
        val tvDate: TextView = itemView.findViewById(R.id.tvTxnDate)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_transaction, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = items[position]
        val isCredit = item.type?.equals("credit", ignoreCase = true) == true
        holder.tvType.text = item.type?.replaceFirstChar { it.uppercase() } ?: "-"
        val sign = if (isCredit) "+" else "-"
        holder.tvAmount.text = String.format("%s%.2f", sign, item.amount)
        val ctx = holder.itemView.context
        holder.tvAmount.setTextColor(
            ctx.getColor(if (isCredit) R.color.credit_green else R.color.debit_red)
        )
        holder.tvReason.text = item.reason ?: ""
        holder.tvDate.text = item.createdAt ?: ""
    }

    override fun getItemCount(): Int = items.size
}
