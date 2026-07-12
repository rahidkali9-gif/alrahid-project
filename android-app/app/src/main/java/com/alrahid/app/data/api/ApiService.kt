package com.alrahid.app.data.api

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
import com.alrahid.app.data.model.AuthResponse
import com.alrahid.app.data.model.ChangePasswordRequest
import com.alrahid.app.data.model.CreateApiKeyRequest
import com.alrahid.app.data.model.ForgotPasswordRequest
import com.alrahid.app.data.model.LoginRequest
import com.alrahid.app.data.model.NotificationListResponse
import com.alrahid.app.data.model.RefreshRequest
import com.alrahid.app.data.model.RegisterRequest
import com.alrahid.app.data.model.ResetPasswordRequest
import com.alrahid.app.data.model.TransactionListResponse
import com.alrahid.app.data.model.UpdateProfileRequest
import com.alrahid.app.data.model.UserProfileResponse
import com.alrahid.app.data.model.WalletResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/**
 * Retrofit interface describing every REST endpoint the Al Rahid Android app
 * uses. All paths are relative to [com.alrahid.app.util.Constants.API_BASE_URL].
 *
 * Endpoints that require authentication are handled transparently by the auth
 * interceptor installed in [RetrofitClient] (it attaches the `Authorization:
 * Bearer <token>` header from the stored session).
 */
interface ApiService {

    // ===== Auth =====
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Unit>>

    @POST("auth/refresh")
    suspend fun refresh(@Body request: RefreshRequest): Response<AuthResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiResponse<Unit>>

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse<Unit>>

    @POST("auth/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ApiResponse<Unit>>

    // ===== User profile =====
    @GET("users/profile")
    suspend fun getProfile(): Response<UserProfileResponse>

    @PUT("users/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<Unit>>

    // ===== Notifications =====
    @GET("notifications")
    suspend fun getNotifications(): Response<NotificationListResponse>

    @PATCH("notifications/{id}/read")
    suspend fun markRead(@Path("id") id: String): Response<ApiResponse<Unit>>

    @PATCH("notifications/read-all")
    suspend fun markAllRead(): Response<ApiResponse<Unit>>

    // ===== Wallet =====
    @GET("wallet")
    suspend fun getWallet(): Response<WalletResponse>

    @GET("wallet/transactions")
    suspend fun getTransactions(): Response<TransactionListResponse>

    // ===== Activity =====
    @GET("activity")
    suspend fun getActivity(): Response<ActivityListResponse>

    // ===== API keys =====
    @GET("api-keys")
    suspend fun getApiKeys(): Response<ApiKeyListResponse>

    @POST("api-keys")
    suspend fun createApiKey(@Body request: CreateApiKeyRequest): Response<ApiKeyResponse>

    @PATCH("api-keys/{id}/revoke")
    suspend fun revokeApiKey(@Path("id") id: String): Response<ApiResponse<Unit>>

    // ===== AI generation =====
    @POST("ai/chat")
    suspend fun aiChat(@Body request: AiChatRequest): Response<AiResponse>

    @POST("ai/image")
    suspend fun aiImage(@Body request: AiImageRequest): Response<AiResponse>

    @POST("ai/video")
    suspend fun aiVideo(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/voice")
    suspend fun aiVoice(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/music")
    suspend fun aiMusic(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/logo")
    suspend fun aiLogo(@Body request: AiImageRequest): Response<AiResponse>

    @POST("ai/resume")
    suspend fun aiResume(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/presentation")
    suspend fun aiPresentation(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/pdf-summary")
    suspend fun aiPdfSummary(@Body request: AiPdfRequest): Response<AiResponse>

    @POST("ai/code")
    suspend fun aiCode(@Body request: AiCodeRequest): Response<AiResponse>

    @POST("ai/website")
    suspend fun aiWebsite(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/app")
    suspend fun aiApp(@Body request: AiGenericRequest): Response<AiResponse>

    @POST("ai/email")
    suspend fun aiEmail(@Body request: AiEmailRequest): Response<AiResponse>

    @POST("ai/document")
    suspend fun aiDocument(@Body request: AiDocumentRequest): Response<AiResponse>

    @GET("ai/generations")
    suspend fun getAiGenerations(): Response<AiGenerationListResponse>
}
