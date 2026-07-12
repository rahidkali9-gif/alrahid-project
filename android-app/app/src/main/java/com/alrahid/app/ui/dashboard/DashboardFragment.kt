package com.alrahid.app.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.alrahid.app.R
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.databinding.FragmentDashboardBinding
import com.alrahid.app.util.Constants
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

/**
 * The landing screen after login: a wallet balance card on top and a grid of
 * 14 AI feature cards. Quick-access icons for profile / settings /
 * notifications / history live on the header row.
 */
class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DashboardViewModel by activityViewModels()
    private lateinit var session: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        session = SessionManager.get(requireContext())

        setupFeatureCards()
        setupQuickActions()

        viewModel.load(session)

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect { data ->
                    binding.tvBalance.text = String.format("%.2f %s", data.balance, data.currency)
                    binding.tvUserName.text =
                        if (data.userName.isBlank()) getString(R.string.welcome) else data.userName

                    if (data.unreadNotifications > 0) {
                        binding.tvNotifBadge.visibility = View.VISIBLE
                        binding.tvNotifBadge.text = data.unreadNotifications.toString()
                    } else {
                        binding.tvNotifBadge.visibility = View.GONE
                    }

                    data.error?.let {
                        Snackbar.make(binding.root, it, Snackbar.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun setupQuickActions() {
        binding.iconProfile.setOnClickListener {
            findNavController().navigate(R.id.profileFragment)
        }
        binding.iconSettings.setOnClickListener {
            findNavController().navigate(R.id.settingsFragment)
        }
        binding.iconNotifications.setOnClickListener {
            findNavController().navigate(R.id.notificationsFragment)
        }
        binding.iconHistory.setOnClickListener {
            findNavController().navigate(R.id.historyFragment)
        }
    }

    private fun setupFeatureCards() {
        val features = listOf(
            Feature(R.string.ai_chat, R.drawable.ic_ai, Constants.TYPE_CHAT_PLACEHOLDER),
            Feature(R.string.ai_image, R.drawable.ic_ai, Constants.TYPE_IMAGE),
            Feature(R.string.ai_video, R.drawable.ic_ai, Constants.TYPE_VIDEO),
            Feature(R.string.ai_voice, R.drawable.ic_ai, Constants.TYPE_VOICE),
            Feature(R.string.ai_music, R.drawable.ic_ai, Constants.TYPE_MUSIC),
            Feature(R.string.ai_logo, R.drawable.ic_ai, Constants.TYPE_LOGO),
            Feature(R.string.ai_resume, R.drawable.ic_ai, Constants.TYPE_RESUME),
            Feature(R.string.ai_present, R.drawable.ic_ai, Constants.TYPE_PRESENTATION),
            Feature(R.string.ai_pdf, R.drawable.ic_ai, Constants.TYPE_PDF_SUMMARY),
            Feature(R.string.ai_code, R.drawable.ic_ai, Constants.TYPE_CODE),
            Feature(R.string.ai_website, R.drawable.ic_ai, Constants.TYPE_WEBSITE),
            Feature(R.string.ai_app, R.drawable.ic_ai, Constants.TYPE_APP),
            Feature(R.string.ai_email, R.drawable.ic_ai, Constants.TYPE_EMAIL),
            Feature(R.string.ai_document, R.drawable.ic_ai, Constants.TYPE_DOCUMENT)
        )

        val container = binding.featureContainer
        for (feature in features) {
            val card = layoutInflater.inflate(R.layout.item_feature_card, container, false)
            val tv = card.findViewById<android.widget.TextView>(R.id.tvFeatureTitle)
            val iv = card.findViewById<android.widget.ImageView>(R.id.ivFeatureIcon)
            tv.setText(feature.titleRes)
            iv.setImageResource(feature.iconRes)
            card.setOnClickListener { navigateToFeature(feature.type) }
            container.addView(card)
        }
    }

    private fun navigateToFeature(type: String) {
        if (type == Constants.TYPE_CHAT_PLACEHOLDER) {
            findNavController().navigate(R.id.aiChatFragment)
        } else if (type == Constants.TYPE_PDF_SUMMARY) {
            findNavController().navigate(R.id.aiPdfSummaryFragment)
        } else {
            val args = Bundle().apply { putString(Constants.ARG_AI_TYPE, type) }
            findNavController().navigate(R.id.aiGeneratorFragment, args)
        }
    }

    override fun onResume() {
        super.onResume()
        if (this::session.isInitialized) viewModel.load(session)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private data class Feature(val titleRes: Int, val iconRes: Int, val type: String)
}
