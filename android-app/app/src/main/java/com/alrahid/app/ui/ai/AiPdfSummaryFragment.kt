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
import com.alrahid.app.databinding.FragmentAiPdfSummaryBinding
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class AiPdfSummaryFragment : Fragment() {

    private var _binding: FragmentAiPdfSummaryBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AiViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiPdfSummaryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnSummarize.setOnClickListener {
            val text = binding.etInput.text.toString().trim()
            viewModel.summarizePdf(text)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.generationState.collect { state ->
                    when (state) {
                        is AiUiState.Idle -> Unit
                        is AiUiState.Loading -> {
                            binding.progressBar.visibility = View.VISIBLE
                            binding.btnSummarize.isEnabled = false
                            binding.tvResult.visibility = View.GONE
                        }
                        is AiUiState.Success -> {
                            binding.progressBar.visibility = View.GONE
                            binding.btnSummarize.isEnabled = true
                            binding.tvResult.visibility = View.VISIBLE
                            binding.tvResult.text = state.result.text ?: "No summary returned"
                            viewModel.resetGenerationState()
                        }
                        is AiUiState.Error -> {
                            binding.progressBar.visibility = View.GONE
                            binding.btnSummarize.isEnabled = true
                            Snackbar.make(binding.root, state.message, Snackbar.LENGTH_LONG).show()
                            viewModel.resetGenerationState()
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
