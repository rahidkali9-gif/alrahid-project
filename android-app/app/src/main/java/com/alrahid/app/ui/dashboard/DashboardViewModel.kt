package com.alrahid.app.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.data.model.Notification
import com.alrahid.app.data.model.Wallet
import com.alrahid.app.data.repository.AppRepository
import com.alrahid.app.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardData(
    val balance: Double = 0.0,
    val currency: String = "USD",
    val unreadNotifications: Int = 0,
    val userName: String = "",
    val userEmail: String = "",
    val loading: Boolean = false,
    val error: String? = null
)

class DashboardViewModel : ViewModel() {

    private val repository = AppRepository()

    private val _state = MutableStateFlow(DashboardData())
    val state: StateFlow<DashboardData> = _state.asStateFlow()

    fun load(session: SessionManager) {
        _state.value = _state.value.copy(
            userName = session.userName ?: "",
            userEmail = session.userEmail ?: "",
            loading = true,
            error = null
        )
        viewModelScope.launch {
            // Wallet
            when (val res = repository.getWallet()) {
                is Resource.Success -> {
                    val w: Wallet? = res.data?.wallet ?: res.data?.data
                    _state.value = _state.value.copy(
                        balance = w?.balance ?: 0.0,
                        currency = w?.currency ?: "USD"
                    )
                }
                is Resource.Error -> _state.value = _state.value.copy(error = res.message)
                else -> {}
            }
            // Notifications count
            when (val res = repository.getNotifications()) {
                is Resource.Success -> {
                    val list: List<Notification>? =
                        res.data?.notifications ?: res.data?.data
                    val unread = list?.count { !it.read } ?: 0
                    _state.value = _state.value.copy(unreadNotifications = unread)
                }
                is Resource.Error -> Unit // notifications are non-fatal here
                else -> {}
            }
            _state.value = _state.value.copy(loading = false)
        }
    }

    fun unreadCount(session: SessionManager) {
        viewModelScope.launch {
            when (val res = repository.getNotifications()) {
                is Resource.Success -> {
                    val list = res.data?.notifications ?: res.data?.data
                    val unread = list?.count { !it.read } ?: 0
                    _state.value = _state.value.copy(unreadNotifications = unread)
                }
                else -> {}
            }
        }
    }
}
