package com.alrahid.app.util

import com.alrahid.app.BuildConfig

/**
 * THE central configuration file for the Al Rahid Android app.
 *
 * The app talks to exactly one backend server. The base URL of that server is
 * defined in a single place: [API_BASE_URL]. It is sourced from the matching
 * `buildConfigField` declared in `app/build.gradle.kts`, so the value lives in
 * the Gradle build file (the source of truth) and is exposed to Kotlin code
 * via [BuildConfig.API_BASE_URL].
 *
 * >>> To point the app at a different server, change ONLY the value of
 * >>> `API_BASE_URL` in `app/build.gradle.kts` (buildConfigField) and rebuild
 * >>> the APK. The backend never needs to change.
 *
 * `Constants.API_BASE_URL` always mirrors [BuildConfig.API_BASE_URL] at runtime,
 * so the rest of the app simply references `Constants.API_BASE_URL`.
 */
object Constants {

    /**
     * Base URL for all REST API calls. Must end with a trailing slash because
     * Retrofit concatenates it with relative endpoint paths such as `auth/login`.
     */
    val API_BASE_URL: String = BuildConfig.API_BASE_URL

    // ---- SharedPreferences ----
    const val PREF_NAME = "alrahid_prefs"
    const val KEY_ACCESS_TOKEN = "access_token"
    const val KEY_REFRESH_TOKEN = "refresh_token"
    const val KEY_USER_NAME = "user_name"
    const val KEY_USER_EMAIL = "user_email"
    const val KEY_USER_ID = "user_id"

    // ---- Drawer / navigation menu item ids ----
    const val NAV_DASHBOARD = 1001
    const val NAV_AI_CHAT = 1002
    const val NAV_AI_IMAGE = 1003
    const val NAV_AI_VIDEO = 1004
    const val NAV_AI_VOICE = 1005
    const val NAV_AI_MUSIC = 1006
    const val NAV_AI_LOGO = 1007
    const val NAV_AI_RESUME = 1008
    const val NAV_AI_PRESENTATION = 1009
    const val NAV_AI_PDF = 1010
    const val NAV_AI_CODE = 1011
    const val NAV_AI_WEBSITE = 1012
    const val NAV_AI_APP = 1013
    const val NAV_AI_EMAIL = 1014
    const val NAV_AI_DOCUMENT = 1015
    const val NAV_AI_HISTORY = 1016
    const val NAV_PROFILE = 1017
    const val NAV_WALLET = 1018
    const val NAV_NOTIFICATIONS = 1019
    const val NAV_SETTINGS = 1020
    const val NAV_HISTORY = 1021
    const val NAV_LOGOUT = 1022

    // ---- AI feature types (used by AiGeneratorFragment) ----
    const val TYPE_CHAT_PLACEHOLDER = "chat"
    const val TYPE_PDF_SUMMARY = "pdf_summary"

    const val TYPE_IMAGE = "image"
    const val TYPE_VIDEO = "video"
    const val TYPE_VOICE = "voice"
    const val TYPE_MUSIC = "music"
    const val TYPE_LOGO = "logo"
    const val TYPE_RESUME = "resume"
    const val TYPE_PRESENTATION = "presentation"
    const val TYPE_CODE = "code"
    const val TYPE_WEBSITE = "website"
    const val TYPE_APP = "app"
    const val TYPE_EMAIL = "email"
    const val TYPE_DOCUMENT = "document"

    // ---- NavGraph argument keys ----
    const val ARG_AI_TYPE = "type"
}
