package com.alrahid.app.data.model

import com.google.gson.annotations.SerializedName

// =====================================================================================
//  Auth
// =====================================================================================

data class RegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RefreshRequest(
    @SerializedName("refresh_token") val refreshToken: String
)

data class ForgotPasswordRequest(
    @SerializedName("email") val email: String
)

data class ResetPasswordRequest(
    @SerializedName("token") val token: String,
    @SerializedName("password") val password: String
)

data class ChangePasswordRequest(
    @SerializedName("current_password") val currentPassword: String,
    @SerializedName("new_password") val newPassword: String
)

data class AuthResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("access_token") val accessToken: String? = null,
    @SerializedName("refresh_token") val refreshToken: String? = null,
    @SerializedName("user") val user: User? = null
)

// =====================================================================================
//  User / Profile
// =====================================================================================

data class User(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("avatar") val avatar: String? = null,
    @SerializedName("role") val role: String? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class UserProfileResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("user") val user: User? = null,
    @SerializedName("data") val data: User? = null
)

data class UpdateProfileRequest(
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("avatar") val avatar: String? = null
)

// =====================================================================================
//  Notifications
// =====================================================================================

data class Notification(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("type") val type: String? = null,
    @SerializedName("read") val read: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null
)

data class NotificationListResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("notifications") val notifications: List<Notification>? = null,
    @SerializedName("data") val data: List<Notification>? = null
)

// =====================================================================================
//  Wallet
// =====================================================================================

data class Wallet(
    @SerializedName("id") val id: String? = null,
    @SerializedName("balance") val balance: Double = 0.0,
    @SerializedName("currency") val currency: String? = "USD",
    @SerializedName("total_credits_used") val totalCreditsUsed: Double = 0.0,
    @SerializedName("updated_at") val updatedAt: String? = null
)

data class WalletResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("wallet") val wallet: Wallet? = null,
    @SerializedName("data") val data: Wallet? = null
)

data class Transaction(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: String? = null,            // "credit" | "debit"
    @SerializedName("amount") val amount: Double = 0.0,
    @SerializedName("reason") val reason: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class TransactionListResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("transactions") val transactions: List<Transaction>? = null,
    @SerializedName("data") val data: List<Transaction>? = null
)

// =====================================================================================
//  Activity log
// =====================================================================================

data class ActivityLog(
    @SerializedName("id") val id: String,
    @SerializedName("action") val action: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("ip_address") val ipAddress: String? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class ActivityListResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("activities") val activities: List<ActivityLog>? = null,
    @SerializedName("data") val data: List<ActivityLog>? = null
)

// =====================================================================================
//  API keys
// =====================================================================================

data class ApiKey(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String? = null,
    @SerializedName("key") val key: String? = null,
    @SerializedName("key_preview") val keyPreview: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("last_used_at") val lastUsedAt: String? = null
)

data class ApiKeyListResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("api_keys") val apiKeys: List<ApiKey>? = null,
    @SerializedName("data") val data: List<ApiKey>? = null
)

data class CreateApiKeyRequest(
    @SerializedName("name") val name: String
)

data class ApiKeyResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("api_key") val apiKey: ApiKey? = null,
    @SerializedName("data") val data: ApiKey? = null
)

// =====================================================================================
//  AI
// =====================================================================================

data class AiChatRequest(
    @SerializedName("message") val message: String,
    @SerializedName("conversation_id") val conversationId: String? = null,
    @SerializedName("model") val model: String? = null
)

data class AiImageRequest(
    @SerializedName("prompt") val prompt: String,
    @SerializedName("size") val size: String? = null,
    @SerializedName("style") val style: String? = null
)

data class AiGenericRequest(
    @SerializedName("prompt") val prompt: String,
    @SerializedName("model") val model: String? = null,
    @SerializedName("options") val options: Map<String, String>? = null
)

data class AiPdfRequest(
    @SerializedName("text") val text: String,
    @SerializedName("max_length") val maxLength: Int? = null
)

data class AiCodeRequest(
    @SerializedName("prompt") val prompt: String,
    @SerializedName("language") val language: String? = null
)

data class AiEmailRequest(
    @SerializedName("prompt") val prompt: String,
    @SerializedName("tone") val tone: String? = null,
    @SerializedName("recipient") val recipient: String? = null
)

data class AiDocumentRequest(
    @SerializedName("prompt") val prompt: String,
    @SerializedName("document_type") val documentType: String? = null
)

data class AiResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("result") val result: String? = null,
    @SerializedName("output") val output: String? = null,
    @SerializedName("url") val url: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("credits_used") val creditsUsed: Double = 0.0,
    @SerializedName("generation_id") val generationId: String? = null,
    @SerializedName("data") val data: AiResultData? = null
)

/**
 * Some AI endpoints nest the payload under a `data` object. We capture the
 * most common fields and fall back to a raw map if needed.
 */
data class AiResultData(
    @SerializedName("result") val result: String? = null,
    @SerializedName("output") val output: String? = null,
    @SerializedName("url") val url: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("credits_used") val creditsUsed: Double = 0.0
)

data class AiGeneration(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: String? = null,
    @SerializedName("model") val model: String? = null,
    @SerializedName("prompt") val prompt: String? = null,
    @SerializedName("result") val result: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("credits_used") val creditsUsed: Double = 0.0,
    @SerializedName("created_at") val createdAt: String? = null
)

data class AiGenerationListResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("generations") val generations: List<AiGeneration>? = null,
    @SerializedName("data") val data: List<AiGeneration>? = null
)

// =====================================================================================
//  Generic envelope
// =====================================================================================

/**
 * Generic backend envelope used by endpoints that only return a
 * success/message/(optional) data triple.
 */
data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null
)
