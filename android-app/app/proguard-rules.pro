# Add project specific ProGuard rules here.

# Keep BuildConfig
-keep class com.alrahid.app.BuildConfig { *; }

# ---- Retrofit ----
# Retain generic type information for use by reflection.
-keepattributes Signature
# Retain service method parameters.
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
# Ignore annotation used at runtime.
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
# Suppress notes about platforms.
-dontwarn javax.annotation.**
-dontwarn kotlin.Unit
# OkHttp platform used only on JVM and does not use Android platforms.
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ---- OkHttp ----
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-keep class javax.annotation.Nullable
-keep class javax.annotation.Nonnull

# ---- Gson ----
# Gson uses generic type information stored in a signature file.
-keepattributes Signature
# For using GSON @Expose annotation
-keepattributes *Annotation*
# Gson specific classes
-dontwarn sun.misc.**
# Keep generic signatures of TypeToken
-keep class com.google.gson.reflect.TypeToken { *; }
# Keep serializable fields in data models
-keep class com.alrahid.app.data.model.** { *; }
# Keep @SerializedName annotated fields
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
# Keep classes with generic signatures that Gson may reflect on
-keep,allowobfuscation class com.alrahid.app.data.model.**$* { *; }

# ---- Kotlin Coroutines ----
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Keep model classes used in Retrofit responses
-keep class com.alrahid.app.data.model.** { *; }
