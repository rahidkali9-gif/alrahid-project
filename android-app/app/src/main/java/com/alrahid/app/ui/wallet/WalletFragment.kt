package com.alrahid.app.ui.wallet

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.alrahid.app.data.repository.AppRepository
import com.alrahid.app.databinding.FragmentWalletBinding
import com.alrahid.app.ui.adapter.TransactionsAdapter
import com.alrahid.app.util.Resource
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch

class WalletFragment : Fragment() {

    private var _binding: FragmentWalletBinding? = null
    private val binding get() = _binding!!

    private val repository = AppRepository()
    private lateinit var adapter: TransactionsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWalletBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = TransactionsAdapter()
        binding.rvTransactions.layoutManager = LinearLayoutManager(requireContext())
        binding.rvTransactions.adapter = adapter

        loadWallet()
        loadTransactions()

        binding.swipeRefresh.setOnRefreshListener {
            loadWallet()
            loadTransactions()
        }
    }

    private fun loadWallet() {
        viewLifecycleOwner.lifecycleScope.launch {
            when (val res = repository.getWallet()) {
                is Resource.Success -> {
                    val w = res.data?.wallet ?: res.data?.data
                    binding.tvBalance.text = String.format("%.2f", w?.balance ?: 0.0)
                    binding.tvCurrency.text = w?.currency ?: "USD"
                }
                is Resource.Error -> Snackbar.make(binding.root, res.message ?: "Failed", Snackbar.LENGTH_SHORT).show()
                else -> {}
            }
        }
    }

    private fun loadTransactions() {
        viewLifecycleOwner.lifecycleScope.launch {
            when (val res = repository.getTransactions()) {
                is Resource.Success -> {
                    val list = res.data?.transactions ?: res.data?.data ?: emptyList()
                    binding.swipeRefresh.isRefreshing = false
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
