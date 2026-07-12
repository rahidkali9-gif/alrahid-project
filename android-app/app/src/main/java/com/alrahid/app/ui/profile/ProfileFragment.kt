package com.alrahid.app.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.data.repository.AppRepository
import com.alrahid.app.databinding.FragmentProfileBinding
import com.alrahid.app.ui.auth.AuthViewModel
import com.alrahid.app.util.Resource
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val authViewModel: AuthViewModel by activityViewModels()
    private val repository = AppRepository()
    private lateinit var session: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        session = SessionManager.get(requireContext())

        // Pre-fill from the cached session.
        binding.etName.setText(session.userName ?: "")
        binding.etEmail.setText(session.userEmail ?: "")

        binding.btnSave.setOnClickListener {
            val name = binding.etName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            viewLifecycleOwner.lifecycleScope.launch {
                when (val res = repository.updateProfile(name, email, null)) {
                    is Resource.Success -> {
                        session.saveUser(name, email)
                        Snackbar.make(binding.root, "Profile updated", Snackbar.LENGTH_SHORT).show()
                    }
                    is Resource.Error -> Snackbar.make(binding.root, res.message ?: "Failed", Snackbar.LENGTH_LONG).show()
                    else -> {}
                }
            }
        }

        binding.btnChangePassword.setOnClickListener { showChangePasswordDialog() }
    }

    private fun showChangePasswordDialog() {
        val container = LinearLayout(requireContext()).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(48, 24, 48, 24)
        }
        val current = android.widget.EditText(requireContext()).apply {
            hint = "Current password"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        val newPass = android.widget.EditText(requireContext()).apply {
            hint = "New password"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        container.addView(current)
        container.addView(newPass)

        AlertDialog.Builder(requireContext())
            .setTitle("Change password")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                authViewModel.changePassword(
                    current.text.toString(),
                    newPass.text.toString()
                )
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
