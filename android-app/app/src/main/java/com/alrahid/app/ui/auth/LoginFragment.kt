package com.alrahid.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.alrahid.app.R
import com.alrahid.app.databinding.FragmentLoginBinding
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString()
            val password = binding.etPassword.text.toString()
            viewModel.login(email, password)
        }

        binding.tvRegister.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_registerFragment)
        }

        // Clear error hints as the user types.
        binding.etEmail.doAfterTextChanged { binding.tilEmail.error = null }
        binding.etPassword.doAfterTextChanged { binding.tilPassword.error = null }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.loginState.collect { state ->
                    when (state) {
                        is AuthUiState.Idle -> Unit
                        is AuthUiState.Loading -> {
                            binding.btnLogin.isEnabled = false
                            binding.progressBar.visibility = View.VISIBLE
                        }
                        is AuthUiState.Success -> {
                            binding.btnLogin.isEnabled = true
                            binding.progressBar.visibility = View.GONE
                            viewModel.resetLoginState()
                            findNavController().navigate(R.id.action_loginFragment_to_dashboardFragment)
                        }
                        is AuthUiState.Error -> {
                            binding.btnLogin.isEnabled = true
                            binding.progressBar.visibility = View.GONE
                            Snackbar.make(binding.root, state.message, Snackbar.LENGTH_LONG).show()
                            viewModel.resetLoginState()
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
