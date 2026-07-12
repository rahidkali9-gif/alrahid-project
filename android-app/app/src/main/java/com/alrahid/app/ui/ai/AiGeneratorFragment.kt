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
import com.alrahid.app.R
import com.alrahid.app.databinding.FragmentAiGeneratorBinding
import com.alrahid.app.util.Constants
import com.bumptech.glide.Glide
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

/**
 * Generic "prompt -> result" generator screen. Receives a `type` argument
 * (one of [Constants.TYPE_*]) and routes the request to the matching backend
 * endpoint via [AiViewModel.generate].
 */
class AiGeneratorFragment : Fragment() {

    private var _binding: FragmentAiGeneratorBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AiViewModel by activityViewModels()
    private var type: String = Constants.TYPE_IMAGE

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiGeneratorBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        type = arguments?.getString(Constants.ARG_AI_TYPE) ?: Constants.TYPE_IMAGE
        binding.tvTitle.text = titleFor(type)

        binding.btnGenerate.setOnClickListener {
            val prompt = binding.etPrompt.text.toString().trim()
            viewModel.generate(type, prompt)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.generationState.collect { state ->
                    when (state) {
                        is AiUiState.Idle -> Unit
                        is AiUiState.Loading -> {
                            binding.progressBar.visibility = View.VISIBLE
                            binding.btnGenerate.isEnabled = false
                            binding.tvResult.visibility = View.GONE
                            binding.ivResult.visibility = View.GONE
                        }
                        is AiUiState.Success -> {
                            binding.progressBar.visibility = View.GONE
                            binding.btnGenerate.isEnabled = true
                            renderResult(state.result)
                            viewModel.resetGenerationState()
                        }
                        is AiUiState.Error -> {
                            binding.progressBar.visibility = View.GONE
                            binding.btnGenerate.isEnabled = true
                            Snackbar.make(binding.root, state.message, Snackbar.LENGTH_LONG).show()
                            viewModel.resetGenerationState()
                        }
                    }
                }
            }
        }
    }

    private fun renderResult(result: AiResult) {
        // Prefer media URL for image-style outputs.
        if (!result.mediaUrl.isNullOrBlank() && isImageType(type)) {
            binding.ivResult.visibility = View.VISIBLE
            Glide.with(this).load(result.mediaUrl).into(binding.ivResult)
            binding.tvResult.visibility = View.VISIBLE
            binding.tvResult.text = result.mediaUrl
        } else {
            binding.ivResult.visibility = View.GONE
            binding.tvResult.visibility = View.VISIBLE
            binding.tvResult.text = result.text ?: result.mediaUrl ?: "No output returned"
        }
        if (result.creditsUsed > 0) {
            Snackbar.make(
                binding.root,
                "Credits used: ${result.creditsUsed}",
                Snackbar.LENGTH_SHORT
            ).show()
        }
    }

    private fun isImageType(type: String) =
        type == Constants.TYPE_IMAGE || type == Constants.TYPE_LOGO

    private fun titleFor(type: String): String = when (type) {
        Constants.TYPE_IMAGE -> getString(R.string.ai_image)
        Constants.TYPE_VIDEO -> getString(R.string.ai_video)
        Constants.TYPE_VOICE -> getString(R.string.ai_voice)
        Constants.TYPE_MUSIC -> getString(R.string.ai_music)
        Constants.TYPE_LOGO -> getString(R.string.ai_logo)
        Constants.TYPE_RESUME -> getString(R.string.ai_resume)
        Constants.TYPE_PRESENTATION -> getString(R.string.ai_present)
        Constants.TYPE_CODE -> getString(R.string.ai_code)
        Constants.TYPE_WEBSITE -> getString(R.string.ai_website)
        Constants.TYPE_APP -> getString(R.string.ai_app)
        Constants.TYPE_EMAIL -> getString(R.string.ai_email)
        Constants.TYPE_DOCUMENT -> getString(R.string.ai_document)
        else -> getString(R.string.ai_image)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
