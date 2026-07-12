package com.alrahid.app.data.repository

import com.alrahid.app.data.api.ApiService
import com.alrahid.app.data.api.RetrofitClient
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.data.model.ApiResponse
import com.alrahid.app.data.model.AuthResponse
import com.alrahid.app.data.model.ChangePasswordRequest
import com.alrahid.app.data.model.ForgotPasswordRequest
import com.alrahid.app.data.model.LoginRequest
import com.alrahid.app.data.model.RefreshRequest
import com.alrahid.app.data.model.RegisterRequest
import com.alrahid.app.data.model.ResetPasswordRequest
import com.alrahid.app.util.Resource
import com.alrahid.app.AlRahidApp
import org.json.JSONObject
import retrofit2.Response

/**
 * Repository for everything under `/auth`. On successful login/register it
 * persists the returned tokens and user info via [SessionManager]; on logout
 * it clears them.
 */
class AuthRepository {

    private val api: ApiService = RetrofitClient.apiService
    private val session: SessionManager = SessionManager.get(AlRahidApp.instance)

    suspend fun register(name: String, email: String, password: String): Resource<AuthResponse> {
        return try {
            val resp = api.register(RegisterRequest(name, email, password))
            handleAuthResponse(resp)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    suspend fun login(email: String, password: String): Resource<AuthResponse> {
        return try {
            val resp = api.login(LoginRequest(email, password))
            handleAuthResponse(resp)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    suspend fun logout(): Resource<ApiResponse<Unit>> {
        return try {
            val resp = api.logout()
            // Regardless of server response, wipe the local session.
            session.clearAll()
            parseGeneric(resp)
        } catch (e: Exception) {
            // Still clear locally if the call failed (e.g. already expired token).
            session.clearAll()
            Resource.Error(e.message ?: "Network error")
        }
    }

    suspend fun refreshToken(): Resource<AuthResponse> {
        return try {
            val refreshTok = session.refreshToken
                ?: return Resource.Error("No refresh token")
            val resp = api.refresh(RefreshRequest(refreshTok))
            handleAuthResponse(resp)
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    suspend fun forgotPassword(email: String): Resource<ApiResponse<Unit>> {
        return try {
            parseGeneric(api.forgotPassword(ForgotPasswordRequest(email)))
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    suspend fun resetPassword(token: String, password: String): Resource<ApiResponse<Unit>> {
        return try {
            parseGeneric(api.resetPassword(ResetPasswordRequest(token, password)))
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    suspend fun changePassword(current: String, newPass: String): Resource<ApiResponse<Unit>> {
        return try {
            parseGeneric(api.changePassword(ChangePasswordRequest(current, newPass)))
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    // ---- helpers ----

    private fun handleAuthResponse(resp: Response<AuthResponse>): Resource<AuthResponse> {
        return if (resp.isSuccessful) {
            val body = resp.body()
            if (body != null && (body.success || !body.accessToken.isNullOrBlank())) {
                session.saveTokens(
                    accessToken = body.accessToken ?: "",
                    refreshToken = body.refreshToken
                )
                body.user?.let { u ->
                    session.saveUser(u.name, u.email, u.id)
                }
                Resource.Success(body)
            } else {
                Resource.Error(body?.message ?: "Authentication failed")
            }
        } else {
            Resource.Error(extractError(resp))
        }
    }

    private fun parseGeneric(resp: Response<ApiResponse<Unit>>): Resource<ApiResponse<Unit>> {
        return if (resp.isSuccessful) {
            val body = resp.body() ?: ApiResponse(success = true, message = "OK")
            if (body.success) Resource.Success(body)
            else Resource.Error(body.message ?: "Request failed")
        } else {
            Resource.Error(extractError(resp))
        }
    }

    private fun <T> extractError(resp: Response<T>): String {
        val raw = resp.errorBody()?.string() ?: return "HTTP ${resp.code()}"
        return try {
            val json = JSONObject(raw)
            json.optString("message", "HTTP ${resp.code()}")
        } catch (e: Exception) {
            "HTTP ${resp.code()}"
        }
    }
}
