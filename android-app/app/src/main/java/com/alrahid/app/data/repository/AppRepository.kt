package com.alrahid.app.data.repository

import com.alrahid.app.data.api.ApiService
import com.alrahid.app.data.api.RetrofitClient
import com.alrahid.app.data.model.ActivityListResponse
import com.alrahid.app.data.model.AiChatRequest
import com.alrahid.app.data.model.AiCodeRequest
import com.alrahid.app.data.model.AiDocumentRequest
import com.alrahid.app.data.model.AiEmailRequest
import com.alrahid.app.data.model.AiGenericRequest
import com.alrahid.app.data.model.AiGenerationListResponse
import com.alrahid.app.data.model.AiImageRequest
import com.alrahid.app.data.model.AiPdfRequest
import com.alrahid.app.data.model.AiResponse
import com.alrahid.app.data.model.ApiKeyListResponse
import com.alrahid.app.data.model.ApiKeyResponse
import com.alrahid.app.data.model.ApiResponse
import com.alrahid.app.data.model.CreateApiKeyRequest
import com.alrahid.app.data.model.NotificationListResponse
import com.alrahid.app.data.model.TransactionListResponse
import com.alrahid.app.data.model.UpdateProfileRequest
import com.alrahid.app.data.model.UserProfileResponse
import com.alrahid.app.data.model.WalletResponse
import com.alrahid.app.util.Resource
import org.json.JSONObject
import retrofit2.Response

/**
 * Repository for everything that is *not* auth: profile, notifications, wallet,
 * activity log, API keys and all AI generation endpoints.
 */
class AppRepository {

    private val api: ApiService = RetrofitClient.apiService

    // ---- Profile ----
    suspend fun getProfile(): Resource<UserProfileResponse> = safe { api.getProfile() }

    suspend fun updateProfile(name: String?, email: String?, avatar: String?): Resource<ApiResponse<Unit>> {
        return safeGeneric { api.updateProfile(UpdateProfileRequest(name, email, avatar)) }
    }

    // ---- Notifications ----
    suspend fun getNotifications(): Resource<NotificationListResponse> = safe { api.getNotifications() }

    suspend fun markNotificationRead(id: String): Resource<ApiResponse<Unit>> =
        safeGeneric { api.markRead(id) }

    suspend fun markAllNotificationsRead(): Resource<ApiResponse<Unit>> =
        safeGeneric { api.markAllRead() }

    // ---- Wallet ----
    suspend fun getWallet(): Resource<WalletResponse> = safe { api.getWallet() }

    suspend fun getTransactions(): Resource<TransactionListResponse> = safe { api.getTransactions() }

    // ---- Activity ----
    suspend fun getActivity(): Resource<ActivityListResponse> = safe { api.getActivity() }

    // ---- API keys ----
    suspend fun getApiKeys(): Resource<ApiKeyListResponse> = safe { api.getApiKeys() }

    suspend fun createApiKey(name: String): Resource<ApiKeyResponse> =
        safe { api.createApiKey(CreateApiKeyRequest(name)) }

    suspend fun revokeApiKey(id: String): Resource<ApiResponse<Unit>> =
        safeGeneric { api.revokeApiKey(id) }

    // ---- AI generation ----
    suspend fun aiChat(message: String, conversationId: String? = null): Resource<AiResponse> =
        safe { api.aiChat(AiChatRequest(message, conversationId)) }

    suspend fun aiImage(prompt: String, size: String? = null, style: String? = null): Resource<AiResponse> =
        safe { api.aiImage(AiImageRequest(prompt, size, style)) }

    suspend fun aiVideo(prompt: String): Resource<AiResponse> =
        safe { api.aiVideo(AiGenericRequest(prompt)) }

    suspend fun aiVoice(prompt: String): Resource<AiResponse> =
        safe { api.aiVoice(AiGenericRequest(prompt)) }

    suspend fun aiMusic(prompt: String): Resource<AiResponse> =
        safe { api.aiMusic(AiGenericRequest(prompt)) }

    suspend fun aiLogo(prompt: String, size: String? = null, style: String? = null): Resource<AiResponse> =
        safe { api.aiLogo(AiImageRequest(prompt, size, style)) }

    suspend fun aiResume(prompt: String): Resource<AiResponse> =
        safe { api.aiResume(AiGenericRequest(prompt)) }

    suspend fun aiPresentation(prompt: String): Resource<AiResponse> =
        safe { api.aiPresentation(AiGenericRequest(prompt)) }

    suspend fun aiPdfSummary(text: String): Resource<AiResponse> =
        safe { api.aiPdfSummary(AiPdfRequest(text)) }

    suspend fun aiCode(prompt: String, language: String? = null): Resource<AiResponse> =
        safe { api.aiCode(AiCodeRequest(prompt, language)) }

    suspend fun aiWebsite(prompt: String): Resource<AiResponse> =
        safe { api.aiWebsite(AiGenericRequest(prompt)) }

    suspend fun aiApp(prompt: String): Resource<AiResponse> =
        safe { api.aiApp(AiGenericRequest(prompt)) }

    suspend fun aiEmail(prompt: String, tone: String? = null, recipient: String? = null): Resource<AiResponse> =
        safe { api.aiEmail(AiEmailRequest(prompt, tone, recipient)) }

    suspend fun aiDocument(prompt: String, documentType: String? = null): Resource<AiResponse> =
        safe { api.aiDocument(AiDocumentRequest(prompt, documentType)) }

    suspend fun getAiGenerations(): Resource<AiGenerationListResponse> =
        safe { api.getAiGenerations() }

    // ---- generic helpers ----

    private inline fun <T> safe(call: () -> Response<T>): Resource<T> {
        return try {
            val resp = call()
            if (resp.isSuccessful) {
                val body = resp.body()
                    ?: return Resource.Error("Empty response from server")
                Resource.Success(body)
            } else {
                Resource.Error(extractError(resp))
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }

    private inline fun <T> safeGeneric(call: () -> Response<ApiResponse<T>>): Resource<ApiResponse<T>> {
        return try {
            val resp = call()
            if (resp.isSuccessful) {
                val body = resp.body() ?: ApiResponse(success = true, message = "OK")
                if (body.success) Resource.Success(body)
                else Resource.Error(body.message ?: "Request failed")
            } else {
                Resource.Error(extractError(resp))
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
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
