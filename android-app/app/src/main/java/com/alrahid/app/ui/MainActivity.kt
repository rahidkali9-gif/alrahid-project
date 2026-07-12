package com.alrahid.app.ui

import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import com.alrahid.app.R
import com.alrahid.app.data.local.SessionManager
import com.alrahid.app.databinding.ActivityMainBinding
import com.alrahid.app.util.Constants
import com.google.android.material.navigation.NavigationView
import kotlinx.coroutines.launch

/**
 * Single-Activity host. Owns the [DrawerLayout], [NavigationView] (the drawer
 * menu of all AI features + profile/wallet/etc.) and the [NavHostFragment].
 *
 * On start it checks the session: if the user is not logged in it navigates to
 * the login destination; otherwise it goes to the dashboard. The drawer is
 * hidden while the user is on the login/register screens.
 */
class MainActivity : AppCompatActivity(), NavigationView.OnNavigationItemSelectedListener {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController
    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var session: SessionManager

    // Drawer destinations that should show the "up" hamburger + keep the drawer.
    private val topLevelDestinations = setOf(
        R.id.dashboardFragment,
        R.id.aiChatFragment,
        R.id.aiGeneratorFragment,
        R.id.aiPdfSummaryFragment,
        R.id.aiGenerationsFragment,
        R.id.profileFragment,
        R.id.settingsFragment,
        R.id.walletFragment,
        R.id.notificationsFragment,
        R.id.historyFragment
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        session = SessionManager.get(this)

        setSupportActionBar(binding.toolbar)

        navController = findNavController(R.id.nav_host_fragment)

        appBarConfiguration = AppBarConfiguration.Builder(topLevelDestinations)
            .setOpenableLayout(binding.drawerLayout)
            .build()

        setupActionBarWithNavController(navController, appBarConfiguration)

        binding.navView.setNavigationItemSelectedListener(this)

        // Session check. loginFragment is the nav graph's start destination,
        // so when there is no session we simply stay there. When there IS a
        // session we pop the start destination and go to the dashboard.
        if (session.isLoggedIn) {
            navController.navigate(R.id.dashboardFragment) {
                popUpTo(R.id.loginFragment) { inclusive = true }
            }
        }

        updateDrawerHeader()
    }

    private fun updateDrawerHeader() {
        val header = binding.navView.getHeaderView(0)
        header?.let {
            val nameView = it.findViewById<android.widget.TextView>(R.id.tvDrawerName)
            val emailView = it.findViewById<android.widget.TextView>(R.id.tvDrawerEmail)
            nameView?.text = session.userName ?: getString(R.string.guest_user)
            emailView?.text = session.userEmail ?: ""
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp() || super.onSupportNavigateUp()
    }

    override fun onBackPressed() {
        if (binding.drawerLayout.isDrawerOpen(GravityCompat.START)) {
            binding.drawerLayout.closeDrawer(GravityCompat.START)
        } else {
            super.onBackPressed()
        }
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        binding.drawerLayout.closeDrawer(GravityCompat.START)

        if (!session.isLoggedIn && item.itemId != R.id.nav_logout) {
            navController.navigate(R.id.loginFragment)
            return true
        }

        when (item.itemId) {
            R.id.nav_dashboard -> navController.navigate(R.id.dashboardFragment)
            R.id.nav_ai_chat -> navController.navigate(R.id.aiChatFragment)
            R.id.nav_ai_image -> navigateToGenerator(Constants.TYPE_IMAGE)
            R.id.nav_ai_video -> navigateToGenerator(Constants.TYPE_VIDEO)
            R.id.nav_ai_voice -> navigateToGenerator(Constants.TYPE_VOICE)
            R.id.nav_ai_music -> navigateToGenerator(Constants.TYPE_MUSIC)
            R.id.nav_ai_logo -> navigateToGenerator(Constants.TYPE_LOGO)
            R.id.nav_ai_resume -> navigateToGenerator(Constants.TYPE_RESUME)
            R.id.nav_ai_presentation -> navigateToGenerator(Constants.TYPE_PRESENTATION)
            R.id.nav_ai_pdf -> navController.navigate(R.id.aiPdfSummaryFragment)
            R.id.nav_ai_code -> navigateToGenerator(Constants.TYPE_CODE)
            R.id.nav_ai_website -> navigateToGenerator(Constants.TYPE_WEBSITE)
            R.id.nav_ai_app -> navigateToGenerator(Constants.TYPE_APP)
            R.id.nav_ai_email -> navigateToGenerator(Constants.TYPE_EMAIL)
            R.id.nav_ai_document -> navigateToGenerator(Constants.TYPE_DOCUMENT)
            R.id.nav_ai_history -> navController.navigate(R.id.aiGenerationsFragment)
            R.id.nav_profile -> navController.navigate(R.id.profileFragment)
            R.id.nav_wallet -> navController.navigate(R.id.walletFragment)
            R.id.nav_notifications -> navController.navigate(R.id.notificationsFragment)
            R.id.nav_settings -> navController.navigate(R.id.settingsFragment)
            R.id.nav_history -> navController.navigate(R.id.historyFragment)
            R.id.nav_logout -> performLogout()
            else -> return false
        }
        return true
    }

    private fun navigateToGenerator(type: String) {
        val args = Bundle().apply { putString(Constants.ARG_AI_TYPE, type) }
        navController.navigate(R.id.aiGeneratorFragment, args)
    }

    private fun performLogout() {
        lifecycleScope.launch {
            session.clearAll()
            updateDrawerHeader()
            navController.navigate(R.id.loginFragment) {
                popUpTo(R.id.dashboardFragment) { inclusive = true }
            }
        }
    }

    fun refreshDrawerHeader() = updateDrawerHeader()
}
