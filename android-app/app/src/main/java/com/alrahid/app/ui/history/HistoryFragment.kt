package com.alrahid.app.ui.history

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.alrahid.app.R
import com.alrahid.app.data.repository.AppRepository
import com.alrahid.app.databinding.FragmentHistoryBinding
import com.alrahid.app.ui.adapter.ActivityAdapter
import com.alrahid.app.util.Resource
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

/**
 * Account activity log (GET /activity). Reuses the simple list adapter that
 * renders a title + subtitle line.
 */
class HistoryFragment : Fragment() {

    private var _binding: FragmentHistoryBinding? = null
    private val binding get() = _binding!!

    private val repository = AppRepository()
    private lateinit var adapter: ActivityAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = ActivityAdapter()
        binding.rvHistory.layoutManager = LinearLayoutManager(requireContext())
        binding.rvHistory.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener { load() }
        load()
    }

    private fun load() {
        viewLifecycleOwner.lifecycleScope.launch {
            when (val res = repository.getActivity()) {
                is Resource.Success -> {
                    binding.swipeRefresh.isRefreshing = false
                    val list = res.data?.activities ?: res.data?.data ?: emptyList()
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
