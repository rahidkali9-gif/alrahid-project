package com.alrahid.app.data.api

import com.alrahid.app.AlRahidApp
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.util.Constants
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton holder for the Retrofit [ApiService].
 *
 * The single source of truth for the server URL is
 * [com.alrahid.app.util.Constants.API_BASE_URL] (which in turn reads
 * `BuildConfig.API_BASE_URL`). Changing that one value and rebuilding makes
 * the whole app talk to a different server.
 *
 * Two interceptors are installed:
 *  - [AuthInterceptor]  : attaches `Authorization: Bearer <token>` when a
 *    session is present and the request does not already carry an
 *    Authorization header (so the auth endpoints themselves still work).
 *  - HttpLoggingInterceptor: bodies in debug builds, none in release.
 */
object RetrofitClient {

    private val sessionManager: SessionManager by lazy {
        SessionManager.get(AlRahidApp.instance)
    }

    private val gson: Gson = GsonBuilder()
        .setLenient()
        .create()

    private val authInterceptor = Interceptor { chain ->
        val request = chain.request()
        val builder = request.newBuilder()

        val token = sessionManager.accessToken
        val needsAuth = request.header("Authorization") == null &&
            !request.url.encodedPath.contains("auth/login") &&
            !request.url.encodedPath.contains("auth/register") &&
            !request.url.encodedPath.contains("auth/forgot-password") &&
            !request.url.encodedPath.contains("auth/reset-password")

        if (!token.isNullOrBlank() && needsAuth) {
            builder.addHeader("Authorization", "Bearer $token")
        }
        // Always send JSON.
        if (request.body != null && request.header("Content-Type") == null) {
            builder.addHeader("Content-Type", "application/json")
        }
        chain.proceed(builder.build())
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(Constants.API_BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create(gson))
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
