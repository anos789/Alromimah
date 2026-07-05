package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppDatabase
import com.example.data.CryptoRetrofitClient
import com.example.data.GeminiHelper
import com.example.data.TransactionItem
import com.example.data.WalletBalance
import com.example.data.WatchlistItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.random.Random

// --- Coin Data Structure ---

data class Coin(
    val name: String,
    val symbol: String,
    val price: Double,
    val change24h: Double, // e.g. +2.45 or -1.20
    val high24h: Double,
    val low24h: Double,
    val volume: Double,
    val sparkline: List<Double>
)

class TradingViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getDatabase(application)
    private val dao = db.tradingDao()

    // --- State Variables ---

    // Selected Ticker for trading / charting
    private val _selectedSymbol = MutableStateFlow("BTC")
    val selectedSymbol: StateFlow<String> = _selectedSymbol.asStateFlow()

    // Real-time market prices
    private val _coins = MutableStateFlow<List<Coin>>(emptyList())
    val coins: StateFlow<List<Coin>> = _coins.asStateFlow()

    // UI Tab selection: 0 = Markets, 1 = Trade, 2 = Wallet, 3 = AI Assistant
    private val _selectedTab = MutableStateFlow(0)
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    // Watchlist from Room Database
    val watchlist: StateFlow<List<WatchlistItem>> = dao.getWatchlist()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Transactions from Room Database
    val transactions: StateFlow<List<TransactionItem>> = dao.getTransactions()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Wallet Balance from Room Database
    val walletBalance: StateFlow<WalletBalance> = dao.getBalance()
        .combine(MutableStateFlow(WalletBalance())) { dbBal, defaultBal ->
            dbBal ?: defaultBal
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), WalletBalance())

    // AI Chat State
    private val _aiChatHistory = MutableStateFlow<List<Pair<String, Boolean>>>(
        listOf(
            "أهلاً بك في مساعد التداول الذكي! أنا مدعوم بنموذج Gemini 3.5. يمكنني تحليل الأسواق، شرح استراتيجيات التداول، وتقديم تحليل فني أو توضيح المؤشرات لك. كيف يمكنني مساعدتك اليوم؟" to false
        )
    )
    val aiChatHistory: StateFlow<List<Pair<String, Boolean>>> = _aiChatHistory.asStateFlow()

    private val _isAiLoading = MutableStateFlow(false)
    val isAiLoading: StateFlow<Boolean> = _isAiLoading.asStateFlow()

    // --- Initialize & Mock Live Price Ticking ---

    init {
        // Setup default wallet balance in DB if empty
        viewModelScope.launch {
            val current = dao.getBalance().first()
            if (current == null) {
                dao.updateBalance(WalletBalance())
            }
        }

        // Initialize base coins with placeholder values before live update completes
        val baseCoins = listOf(
            Coin("Bitcoin", "BTC", 91240.0, 3.45, 92500.0, 89100.0, 12450.0, generateInitialSparkline(91240.0)),
            Coin("Ethereum", "ETH", 3240.5, -1.20, 3350.0, 3180.0, 45200.0, generateInitialSparkline(3240.5)),
            Coin("Solana", "SOL", 188.4, 8.12, 192.5, 172.0, 98400.0, generateInitialSparkline(188.4)),
            Coin("Binance Coin", "BNB", 590.2, 0.45, 605.0, 582.0, 15000.0, generateInitialSparkline(590.2)),
            Coin("Ripple", "XRP", 1.15, -4.30, 1.25, 1.10, 240000.0, generateInitialSparkline(1.15)),
            Coin("Cardano", "ADA", 0.65, 1.15, 0.68, 0.62, 110000.0, generateInitialSparkline(0.65))
        )
        _coins.value = baseCoins

        // Live ticking coroutine fetching from real Binance global API (with local random walk fallback)
        viewModelScope.launch(Dispatchers.Default) {
            val symbols = listOf(
                "BTC" to "Bitcoin",
                "ETH" to "Ethereum",
                "SOL" to "Solana",
                "BNB" to "Binance Coin",
                "XRP" to "Ripple",
                "ADA" to "Cardano"
            )

            while (true) {
                try {
                    val updatedCoins = symbols.map { (symbol, name) ->
                        val binanceSymbol = "${symbol}USDT"
                        val ticker = CryptoRetrofitClient.api.getTicker24h(binanceSymbol)
                        val price = ticker.lastPrice.toDoubleOrNull() ?: 0.0
                        val change = ticker.priceChangePercent.toDoubleOrNull() ?: 0.0
                        val high = ticker.highPrice.toDoubleOrNull() ?: 0.0
                        val low = ticker.lowPrice.toDoubleOrNull() ?: 0.0
                        val volume = ticker.volume.toDoubleOrNull() ?: 0.0

                        val existingCoin = _coins.value.find { it.symbol == symbol }
                        val currentSparkline = existingCoin?.sparkline ?: generateInitialSparkline(price)
                        val newSparkline = (currentSparkline + price).takeLast(20)

                        Coin(
                            name = name,
                            symbol = symbol,
                            price = price,
                            change24h = change,
                            high24h = high,
                            low24h = low,
                            volume = volume,
                            sparkline = newSparkline
                        )
                    }
                    _coins.value = updatedCoins
                } catch (e: Exception) {
                    // Fallback: If network is offline or rate limited, perform simulated minor updates
                    _coins.value = _coins.value.map { coin ->
                        val changePercent = (Random.nextDouble() - 0.48) * 0.1
                        val newPrice = coin.price * (1.0 + (changePercent / 100.0))
                        val newChange = coin.change24h + changePercent
                        val newSparkline = (coin.sparkline + newPrice).takeLast(20)
                        coin.copy(
                            price = newPrice,
                            change24h = newChange,
                            sparkline = newSparkline
                        )
                    }
                }
                delay(4000) // update every 4 seconds
            }
        }
    }

    private fun generateInitialSparkline(basePrice: Double): List<Double> {
        val list = mutableListOf<Double>()
        var price = basePrice * 0.95
        for (i in 0 until 20) {
            val drift = (Random.nextDouble() - 0.47) * 0.01
            price *= (1.0 + drift)
            list.add(price)
        }
        return list
    }

    // --- Actions ---

    fun selectSymbol(symbol: String) {
        _selectedSymbol.value = symbol
    }

    fun selectTab(tab: Int) {
        _selectedTab.value = tab
    }

    // Toggle watchlist
    fun toggleWatchlist(symbol: String) {
        viewModelScope.launch {
            val watched = dao.isWatched(symbol)
            if (watched) {
                dao.removeFromWatchlist(symbol)
            } else {
                dao.addToWatchlist(WatchlistItem(symbol))
            }
        }
    }

    // Place a mock order
    fun placeOrder(type: String, amount: Double, price: Double): String {
        if (amount <= 0.0) return "يرجى إدخال كمية صالحة."

        val symbol = _selectedSymbol.value
        val cost = amount * price

        var successMessage = ""

        viewModelScope.launch {
            val balance = walletBalance.value

            if (type == "BUY") {
                if (balance.usdt < cost) {
                    successMessage = "فشل الطلب: رصيد USDT غير كافٍ."
                } else {
                    // Update balance
                    val updatedBal = when (symbol) {
                        "BTC" -> balance.copy(usdt = balance.usdt - cost, btc = balance.btc + amount)
                        "ETH" -> balance.copy(usdt = balance.usdt - cost, eth = balance.eth + amount)
                        "SOL" -> balance.copy(usdt = balance.usdt - cost, sol = balance.sol + amount)
                        "BNB" -> balance.copy(usdt = balance.usdt - cost, bnb = balance.bnb + amount)
                        else -> balance.copy(usdt = balance.usdt - cost) // fallback or other coins
                    }
                    dao.updateBalance(updatedBal)
                    dao.insertTransaction(
                        TransactionItem(
                            symbol = symbol,
                            type = "BUY",
                            amount = amount,
                            price = price,
                            total = cost
                        )
                    )
                    successMessage = "تم تنفيذ طلب شراء $amount $symbol بنجاح!"
                }
            } else { // SELL
                val userHolding = when (symbol) {
                    "BTC" -> balance.btc
                    "ETH" -> balance.eth
                    "SOL" -> balance.sol
                    "BNB" -> balance.bnb
                    else -> 0.0
                }

                if (userHolding < amount) {
                    successMessage = "فشل الطلب: رصيد $symbol غير كافٍ للبيع."
                } else {
                    val updatedBal = when (symbol) {
                        "BTC" -> balance.copy(usdt = balance.usdt + cost, btc = balance.btc - amount)
                        "ETH" -> balance.copy(usdt = balance.usdt + cost, eth = balance.eth - amount)
                        "SOL" -> balance.copy(usdt = balance.usdt + cost, sol = balance.sol - amount)
                        "BNB" -> balance.copy(usdt = balance.usdt + cost, bnb = balance.bnb - amount)
                        else -> balance.copy(usdt = balance.usdt + cost)
                    }
                    dao.updateBalance(updatedBal)
                    dao.insertTransaction(
                        TransactionItem(
                            symbol = symbol,
                            type = "SELL",
                            amount = amount,
                            price = price,
                            total = cost
                        )
                    )
                    successMessage = "تم تنفيذ طلب بيع $amount $symbol بنجاح!"
                }
            }
        }

        return successMessage
    }

    // Deposits mock USDT
    fun depositUSDT(amount: Double) {
        viewModelScope.launch {
            val balance = walletBalance.value
            dao.updateBalance(balance.copy(usdt = balance.usdt + amount))
            dao.insertTransaction(
                TransactionItem(
                    symbol = "USDT",
                    type = "DEPOSIT",
                    amount = amount,
                    price = 1.0,
                    total = amount
                )
            )
        }
    }

    // AI chat integration with Gemini
    fun askAiAssistant(query: String) {
        if (query.isBlank()) return

        // Append user question to history
        _aiChatHistory.value = _aiChatHistory.value + (query to true)
        _isAiLoading.value = true

        viewModelScope.launch {
            val currentCoins = _coins.value
            val currentSymbol = _selectedSymbol.value
            val currentCoin = currentCoins.find { it.symbol == currentSymbol }

            // Context injection: Give Gemini real-time details of the current coin
            val coinContext = if (currentCoin != null) {
                "سعر ${currentCoin.name} (${currentCoin.symbol}) الحالي هو \$${String.format("%,.2f", currentCoin.price)} مع نسبة تغير 24 ساعة بمقدار ${String.format("%+.2f", currentCoin.change24h)}%."
            } else ""

            val systemInstruction = """
                أنت مساعد التداول الذكي في تطبيق "Marium MEXC". تقدم نصائح وشروحات مالية وتحليل للأسواق المالية والعملات المشفرة باللغة العربية بأسلوب احترافي، مهذب، ودقيق.
                تنبيه: يجب دائماً تذكير المستخدم بأن نصائح الذكاء الاصطناعي لا تعتبر نصائح استثمارية مطلقة، وأن عليه اتخاذ قراراته المالية بحذر ومسؤولية.
                حافظ على إجابات مفيدة، واضحة، ومنسقة بشكل جميل باللغة العربية.
            """.trimIndent()

            val fullPrompt = """
                سؤال المستخدم: $query
                
                بيانات السوق الحالية للمساعدة:
                $coinContext
                عملات أخرى متاحة في التطبيق: ${currentCoins.joinToString { "${it.symbol}: \$${String.format("%,.2f", it.price)}" }}
            """.trimIndent()

            val aiResponse = withContext(Dispatchers.IO) {
                GeminiHelper.getTradingInsight(fullPrompt, systemInstruction)
            }

            _aiChatHistory.value = _aiChatHistory.value + (aiResponse to false)
            _isAiLoading.value = false
        }
    }

    fun clearChat() {
        _aiChatHistory.value = listOf(
            "تمت إعادة تعيين المحادثة. كيف يمكنني مساعدتك اليوم في تداولاتك؟" to false
        )
    }
}
