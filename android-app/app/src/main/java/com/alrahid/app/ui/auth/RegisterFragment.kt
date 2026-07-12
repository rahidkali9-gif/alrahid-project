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
import com.alrahid.app.databinding.FragmentRegisterBinding
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AuthViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnRegister.setOnClickListener {
            val name = binding.etName.text.toString()
            val email = binding.etEmail.text.toString()
            val password = binding.etPassword.text.toString()
            val confirm = binding.etConfirm.text.toString()
            viewModel.register(name, email, password, confirm)
        }

        binding.tvLogin.setOnClickListener {
            findNavController().navigate(R.id.action_registerFragment_to_loginFragment)
        }

        binding.etName.doAfterTextChanged { binding.tilName.error = null }
        binding.etEmail.doAfterTextChanged { binding.tilEmail.error = null }
        binding.etPassword.doAfterTextChanged { binding.tilPassword.error = null }
        binding.etConfirm.doAfterTextChanged { binding.tilConfirm.error = null }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.registerState.collect { state ->
                    when (state) {
                        is AuthUiState.Idle -> Unit
                        is AuthUiState.Loading -> {
                            binding.btnRegister.isEnabled = false
                            binding.progressBar.visibility = View.VISIBLE
                        }
                        is AuthUiState.Success -> {
                            binding.btnRegister.isEnabled = true
                            binding.progressBar.visibility = View.GONE
                            Snackbar.make(binding.root, "Registration successful", Snackbar.LENGTH_SHORT).show()
                            viewModel.resetRegisterState()
                            findNavController().navigate(R.id.action_registerFragment_to_loginFragment)
                        }
                        is AuthUiState.Error -> {
                            binding.btnRegister.isEnabled = true
                            binding.progressBar.visibility = View.GONE
                            Snackbar.make(binding.root, state.message, Snackbar.LENGTH_LONG).show()
                            viewModel.resetRegisterState()
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
