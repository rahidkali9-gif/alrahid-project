package com.alrahid.app

import android.app.Application

/**
 * Application entry point for the Al Rahid app.
 *
 * Currently intentionally lightweight: token storage, the Retrofit client and
 * repositories are lazily created on first access. This class exists so that
 * future global initialisation (analytics, crash reporting, etc.) has a place
 * to live and so that the manifest can reference an Application name.
 */
class AlRahidApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        @Volatile
        lateinit var instance: AlRahidApp
            private set
    }
}
