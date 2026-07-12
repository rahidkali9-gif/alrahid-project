package com.alrahid.app.ui.ai

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.alrahid.app.data.model.AiGeneration
import com.alrahid.app.data.repository.AppRepository
import com.alrahid.app.util.Constants
import com.alrahid.app.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Result of a single AI generation call. `text` carries the textual result
 * (chat, code, email, summary...). `mediaUrl` carries the URL of a generated
 * image/video/voice/music asset when present.
 */
data class AiResult(
    val text: String? = null,
    val mediaUrl: String? = null,
    val creditsUsed: Double = 0.0,
    val generationId: String? = null
)

sealed class AiUiState {
    data object Idle : AiUiState()
    data object Loading : AiUiState()
    data class Success(val result: AiResult) : AiUiState()
    data class Error(val message: String) : AiUiState()
}

data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)

data class GenerationsUiState(
    val loading: Boolean = false,
    val items: List<AiGeneration> = emptyList(),
    val error: String? = null
)

class AiViewModel : ViewModel() {

    private val repository = AppRepository()

    private val _generationState = MutableStateFlow<AiUiState>(AiUiState.Idle)
    val generationState: StateFlow<AiUiState> = _generationState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _generations = MutableStateFlow(GenerationsUiState())
    val generations: StateFlow<GenerationsUiState> = _generations.asStateFlow()

    // ---- Generic generation dispatch ----

    /**
     * Routes the request to the correct backend endpoint based on [type],
     * one of the `Constants.TYPE_*` values.
     */
    fun generate(type: String, prompt: String, extra: Map<String, String> = emptyMap()) {
        if (prompt.isBlank()) {
            _generationState.value = AiUiState.Error("Prompt is required")
            return
        }
        _generationState.value = AiUiState.Loading
        viewModelScope.launch {
            val res = when (type) {
                Constants.TYPE_IMAGE ->
                    repository.aiImage(prompt, extra["size"], extra["style"])
                Constants.TYPE_LOGO ->
                    repository.aiLogo(prompt, extra["size"], extra["style"])
                Constants.TYPE_VIDEO -> repository.aiVideo(prompt)
                Constants.TYPE_VOICE -> repository.aiVoice(prompt)
                Constants.TYPE_MUSIC -> repository.aiMusic(prompt)
                Constants.TYPE_RESUME -> repository.aiResume(prompt)
                Constants.TYPE_PRESENTATION -> repository.aiPresentation(prompt)
                Constants.TYPE_CODE -> repository.aiCode(prompt, extra["language"])
                Constants.TYPE_WEBSITE -> repository.aiWebsite(prompt)
                Constants.TYPE_APP -> repository.aiApp(prompt)
                Constants.TYPE_EMAIL ->
                    repository.aiEmail(prompt, extra["tone"], extra["recipient"])
                Constants.TYPE_DOCUMENT -> repository.aiDocument(prompt, extra["document_type"])
                else -> repository.aiImage(prompt)
            }
            _generationState.value = when (res) {
                is Resource.Success -> AiUiState.Success(mapResult(res.data))
                is Resource.Error -> AiUiState.Error(res.message ?: "Generation failed")
                else -> AiUiState.Error("Unknown error")
            }
        }
    }

    fun summarizePdf(text: String) {
        if (text.isBlank()) {
            _generationState.value = AiUiState.Error("Text is required")
            return
        }
        _generationState.value = AiUiState.Loading
        viewModelScope.launch {
            val res = repository.aiPdfSummary(text)
            _generationState.value = when (res) {
                is Resource.Success -> AiUiState.Success(mapResult(res.data))
                is Resource.Error -> AiUiState.Error(res.message ?: "Summary failed")
                else -> AiUiState.Error("Unknown error")
            }
        }
    }

    private fun mapResult(data: com.alrahid.app.data.model.AiResponse?): AiResult {
        if (data == null) return AiResult(text = null)
        val text = data.result
            ?: data.output
            ?: data.data?.result
            ?: data.data?.output
            ?: data.message
        val url = data.url
            ?: data.imageUrl
            ?: data.data?.url
            ?: data.data?.imageUrl
        return AiResult(
            text = text,
            mediaUrl = url,
            creditsUsed = data.creditsUsed.takeIf { it > 0 }
                ?: data.data?.creditsUsed ?: 0.0,
            generationId = data.generationId
        )
    }

    fun resetGenerationState() { _generationState.value = AiUiState.Idle }

    // ---- Chat ----

    fun sendChat(message: String) {
        if (message.isBlank()) return
        // Optimistically show the user's message.
        _messages.value = _messages.value + ChatMessage(message, isUser = true)
        _generationState.value = AiUiState.Loading
        viewModelScope.launch {
            val res = repository.aiChat(message)
            _generationState.value = when (res) {
                is Resource.Success -> {
                    val reply = mapResult(res.data).text ?: "..."
                    _messages.value = _messages.value + ChatMessage(reply, isUser = false)
                    AiUiState.Idle
                }
                is Resource.Error -> {
                    _messages.value = _messages.value + ChatMessage(res.message ?: "Error", isUser = false)
                    AiUiState.Error(res.message ?: "Chat failed")
                }
                else -> AiUiState.Error("Unknown error")
            }
        }
    }

    fun clearChat() { _messages.value = emptyList() }

    // ---- Generations history ----

    fun loadGenerations() {
        _generations.value = _generations.value.copy(loading = true, error = null)
        viewModelScope.launch {
            val res = repository.getAiGenerations()
            _generations.value = when (res) {
                is Resource.Success -> {
                    val list = res.data?.generations ?: res.data?.data ?: emptyList()
                    GenerationsUiState(loading = false, items = list)
                }
                is Resource.Error -> GenerationsUiState(loading = false, error = res.message)
                else -> GenerationsUiState(loading = false, error = "Unknown error")
            }
        }
    }
}
