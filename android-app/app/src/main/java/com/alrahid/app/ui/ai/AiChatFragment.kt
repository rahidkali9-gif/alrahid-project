package com.alrahid.app.ui.ai

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.alrahid.app.databinding.FragmentAiChatBinding
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

/**
 * Chat UI backed by [AiViewModel.sendChat]. Messages are kept in the shared
 * ViewModel so they survive configuration changes.
 */
class AiChatFragment : Fragment() {

    private var _binding: FragmentAiChatBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AiViewModel by activityViewModels()
    private lateinit var adapter: ChatAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiChatBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = ChatAdapter()
        binding.rvMessages.layoutManager = LinearLayoutManager(requireContext()).apply {
            stackFromEnd = true
        }
        binding.rvMessages.adapter = adapter

        binding.btnSend.setOnClickListener {
            val text = binding.etMessage.text.toString().trim()
            if (text.isNotEmpty()) {
                viewModel.sendChat(text)
                binding.etMessage.text?.clear()
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.messages.collect { list ->
                    adapter.submit(list)
                    if (list.isNotEmpty()) {
                        binding.rvMessages.scrollToPosition(list.size - 1)
                    }
                }
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.generationState.collect { state ->
                    when (state) {
                        is AiUiState.Loading -> {
                            binding.progressBar.visibility = View.VISIBLE
                            binding.btnSend.isEnabled = false
                        }
                        is AiUiState.Error -> {
                            binding.progressBar.visibility = View.GONE
                            binding.btnSend.isEnabled = true
                            Snackbar.make(binding.root, state.message, Snackbar.LENGTH_SHORT).show()
                            viewModel.resetGenerationState()
                        }
                        else -> {
                            binding.progressBar.visibility = View.GONE
                            binding.btnSend.isEnabled = true
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

/** Simple chat-bubble adapter. */
private class ChatAdapter : androidx.recyclerview.widget.RecyclerView.Adapter<ChatAdapter.VH>() {

    private val items = mutableListOf<ChatMessage>()

    fun submit(list: List<ChatMessage>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    class VH(itemView: View) : androidx.recyclerview.widget.RecyclerView.ViewHolder(itemView) {
        val tvText: android.widget.TextView = itemView.findViewById(com.alrahid.app.R.id.tvChatBubble)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(com.alrahid.app.R.layout.item_chat_bubble, parent, false)
        return VH(v)
    }

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val msg = items[position]
        holder.tvText.text = msg.text
        val lp = holder.itemView.layoutParams as androidx.recyclerview.widget.RecyclerView.LayoutParams
        if (msg.isUser) {
            lp.gravity = android.view.Gravity.END
            holder.tvText.setBackgroundResource(com.alrahid.app.R.drawable.bg_bubble_user)
        } else {
            lp.gravity = android.view.Gravity.START
            holder.tvText.setBackgroundResource(com.alrahid.app.R.drawable.bg_bubble_bot)
        }
        holder.itemView.layoutParams = lp
    }
}
