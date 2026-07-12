package com.alrahid.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.alrahid.app.data.model.AuthResponse
import com.alrahid.app.data.repository.AuthRepository
import com.alrahid.app.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * UI state for the login + register flows. A single [AuthUiState] is exposed
 * so both fragments can observe the same source of truth.
 */
sealed class AuthUiState {
    data object Idle : AuthUiState()
    data object Loading : AuthUiState()
    data class Success(val response: AuthResponse) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel : ViewModel() {

    private val repository = AuthRepository()

    private val _loginState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val loginState: StateFlow<AuthUiState> = _loginState.asStateFlow()

    private val _registerState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val registerState: StateFlow<AuthUiState> = _registerState.asStateFlow()

    private val _changePasswordState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val changePasswordState: StateFlow<AuthUiState> = _changePasswordState.asStateFlow()

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _loginState.value = AuthUiState.Error("Email and password are required")
            return
        }
        viewModelScope.launch {
            _loginState.value = AuthUiState.Loading
            when (val res = repository.login(email.trim(), password)) {
                is Resource.Success -> _loginState.value = AuthUiState.Success(res.data!!)
                is Resource.Error -> _loginState.value = AuthUiState.Error(res.message ?: "Login failed")
                else -> {}
            }
        }
    }

    fun register(name: String, email: String, password: String, confirm: String) {
        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            _registerState.value = AuthUiState.Error("All fields are required")
            return
        }
        if (password != confirm) {
            _registerState.value = AuthUiState.Error("Passwords do not match")
            return
        }
        if (password.length < 6) {
            _registerState.value = AuthUiState.Error("Password must be at least 6 characters")
            return
        }
        viewModelScope.launch {
            _registerState.value = AuthUiState.Loading
            when (val res = repository.register(name.trim(), email.trim(), password)) {
                is Resource.Success -> _registerState.value = AuthUiState.Success(res.data!!)
                is Resource.Error -> _registerState.value = AuthUiState.Error(res.message ?: "Registration failed")
                else -> {}
            }
        }
    }

    fun changePassword(current: String, newPass: String) {
        if (current.isBlank() || newPass.isBlank()) {
            _changePasswordState.value = AuthUiState.Error("All fields are required")
            return
        }
        if (newPass.length < 6) {
            _changePasswordState.value = AuthUiState.Error("New password must be at least 6 characters")
            return
        }
        viewModelScope.launch {
            _changePasswordState.value = AuthUiState.Loading
            when (val res = repository.changePassword(current, newPass)) {
                is Resource.Success -> _changePasswordState.value = AuthUiState.Success(
                    AuthResponse(success = true, message = res.data?.message)
                )
                is Resource.Error -> _changePasswordState.value = AuthUiState.Error(res.message ?: "Failed")
                else -> {}
            }
        }
    }

    fun resetLoginState() { _loginState.value = AuthUiState.Idle }
    fun resetRegisterState() { _registerState.value = AuthUiState.Idle }
    fun resetChangePasswordState() { _changePasswordState.value = AuthUiState.Idle }
}
