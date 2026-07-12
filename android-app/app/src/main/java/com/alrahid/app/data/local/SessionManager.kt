package com.alrahid.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.alrahid.app.util.Constants

/**
 * Thin wrapper around [SharedPreferences] that stores the authenticated
 * session: access/refresh tokens and a cached copy of the user's name and
 * email so that the UI can render the drawer header without an extra network
 * round-trip on every launch.
 *
 * Tokens are kept in plain SharedPreferences for simplicity, matching the
 * project's stated storage strategy. (For production you would move these to
 * EncryptedSharedPreferences.)
 */
class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(Constants.PREF_NAME, Context.MODE_PRIVATE)

    fun saveTokens(accessToken: String, refreshToken: String?) {
        prefs.edit().apply {
            putString(Constants.KEY_ACCESS_TOKEN, accessToken)
            if (refreshToken != null) {
                putString(Constants.KEY_REFRESH_TOKEN, refreshToken)
            }
            apply()
        }
    }

    fun saveUser(name: String?, email: String?, id: String? = null) {
        prefs.edit().apply {
            name?.let { putString(Constants.KEY_USER_NAME, it) }
            email?.let { putString(Constants.KEY_USER_EMAIL, it) }
            id?.let { putString(Constants.KEY_USER_ID, it) }
            apply()
        }
    }

    var accessToken: String?
        get() = prefs.getString(Constants.KEY_ACCESS_TOKEN, null)
        set(value) {
            prefs.edit().putString(Constants.KEY_ACCESS_TOKEN, value).apply()
        }

    val refreshToken: String?
        get() = prefs.getString(Constants.KEY_REFRESH_TOKEN, null)

    val userName: String?
        get() = prefs.getString(Constants.KEY_USER_NAME, null)

    val userEmail: String?
        get() = prefs.getString(Constants.KEY_USER_EMAIL, null)

    val userId: String?
        get() = prefs.getString(Constants.KEY_USER_ID, null)

    val isLoggedIn: Boolean
        get() = !accessToken.isNullOrBlank()

    fun clearAll() {
        prefs.edit().clear().apply()
    }

    companion object {
        @Volatile
        private var INSTANCE: SessionManager? = null

        fun get(context: Context): SessionManager =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: SessionManager(context.applicationContext).also { INSTANCE = it }
            }
    }
}
