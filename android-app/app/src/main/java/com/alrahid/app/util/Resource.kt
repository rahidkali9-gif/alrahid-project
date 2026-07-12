package com.alrahid.app.util

/**
 * A generic wrapper around any async result emitted by repositories and
 * consumed by ViewModels. Following Google's recommended sealed-class pattern
 * for Retrofit + Coroutines + Flow.
 */
sealed class Resource<T>(
    val data: T? = null,
    val message: String? = null
) {
    class Loading<T> : Resource<T>()
    class Success<T>(data: T) : Resource<T>(data)
    class Error<T>(message: String, data: T? = null) : Resource<T>(data, message)
}
