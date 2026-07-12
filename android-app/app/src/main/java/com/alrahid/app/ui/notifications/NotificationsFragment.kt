package com.alrahid.app.ui.notifications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.alrahid.app.data.repository.AppRepository
import com.alrahid.app.databinding.FragmentNotificationsBinding
import com.alrahid.app.ui.adapter.NotificationsAdapter
import com.alrahid.app.util.Resource
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!

    private val repository = AppRepository()
    private lateinit var adapter: NotificationsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = NotificationsAdapter { id -> markRead(id) }
        binding.rvNotifications.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNotifications.adapter = adapter

        binding.btnMarkAllRead.setOnClickListener { markAllRead() }
        binding.swipeRefresh.setOnRefreshListener { load() }

        load()
    }

    private fun load() {
        viewLifecycleOwner.lifecycleScope.launch {
            when (val res = repository.getNotifications()) {
                is Resource.Success -> {
                    binding.swipeRefresh.isRefreshing = false
                    val list = res.data?.notifications ?: res.data?.data ?: emptyList()
                    if (list.isEmpty()) {
                        binding.tvEmpty.visibility = View.VISIBLE
                    } else {
                        binding.tvEmpty.visibility = View.GONE
                        adapter.submit(list)
                    }
                }
                is Resource.Error -> {
                    binding.swipeRefresh.isRefreshing = false
                    Snackbar.make(binding.root, res.message ?: "Failed", Snackbar.LENGTH_SHORT).show()
                }
                else -> {}
            }
        }
    }

    private fun markRead(id: String) {
        viewLifecycleOwner.lifecycleScope.launch {
            when (repository.markNotificationRead(id)) {
                is Resource.Success -> load()
                else -> {}
            }
        }
    }

    private fun markAllRead() {
        viewLifecycleOwner.lifecycleScope.launch {
            when (val res = repository.markAllNotificationsRead()) {
                is Resource.Success -> {
                    Snackbar.make(binding.root, "All marked as read", Snackbar.LENGTH_SHORT).show()
                    load()
                }
                is Resource.Error -> Snackbar.make(binding.root, res.message ?: "Failed", Snackbar.LENGTH_SHORT).show()
                else -> {}
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
