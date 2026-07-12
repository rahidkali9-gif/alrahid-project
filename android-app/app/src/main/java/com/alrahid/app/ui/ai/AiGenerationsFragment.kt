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
import com.alrahid.app.databinding.FragmentAiGenerationsBinding
import com.alrahid.app.ui.adapter.AiGenerationsAdapter
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class AiGenerationsFragment : Fragment() {

    private var _binding: FragmentAiGenerationsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AiViewModel by activityViewModels()
    private lateinit var adapter: AiGenerationsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiGenerationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = AiGenerationsAdapter()
        binding.rvGenerations.layoutManager = LinearLayoutManager(requireContext())
        binding.rvGenerations.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener { viewModel.loadGenerations() }

        viewModel.loadGenerations()

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.generations.collect { state ->
                    binding.swipeRefresh.isRefreshing = state.loading
                    if (state.items.isNotEmpty()) {
                        binding.tvEmpty.visibility = View.GONE
                        adapter.submit(state.items)
                    } else {
                        binding.tvEmpty.visibility = View.VISIBLE
                    }
                    state.error?.let {
                        Snackbar.make(binding.root, it, Snackbar.LENGTH_SHORT).show()
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
