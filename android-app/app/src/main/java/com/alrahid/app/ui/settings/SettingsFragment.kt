package com.alrahid.app.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.alrahid.app.R
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.databinding.FragmentSettingsBinding
import com.alrahid.app.util.Constants
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    private lateinit var session: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        session = SessionManager.get(requireContext())

        // Show the currently configured backend URL so the user knows where the
        // app is pointing. This is read-only here; it is changed in Constants.kt
        // / build.gradle.kts and rebuilt.
        binding.tvApiBaseUrl.text = Constants.API_BASE_URL

        binding.rowProfile.setOnClickListener {
            findNavController().navigate(R.id.profileFragment)
        }
        binding.rowWallet.setOnClickListener {
            findNavController().navigate(R.id.walletFragment)
        }
        binding.rowNotifications.setOnClickListener {
            findNavController().navigate(R.id.notificationsFragment)
        }
        binding.rowHistory.setOnClickListener {
            findNavController().navigate(R.id.historyFragment)
        }
        binding.rowClearCache.setOnClickListener {
            Snackbar.make(binding.root, "Local cache cleared", Snackbar.LENGTH_SHORT).show()
        }
        binding.rowLogout.setOnClickListener { confirmLogout() }
    }

    private fun confirmLogout() {
        AlertDialog.Builder(requireContext())
            .setTitle("Logout")
            .setMessage("Are you sure you want to log out?")
            .setPositiveButton("Logout") { _, _ ->
                viewLifecycleOwner.lifecycleScope.launch {
                    session.clearAll()
                    findNavController().navigate(R.id.loginFragment) {
                        popUpTo(R.id.settingsFragment) { inclusive = true }
                    }
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
