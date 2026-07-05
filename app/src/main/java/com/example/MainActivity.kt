package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.TransactionItem
import com.example.data.WalletBalance
import com.example.data.WatchlistItem
import com.example.ui.Coin
import com.example.ui.TradingViewModel
import com.example.ui.theme.BaseDarkBg
import com.example.ui.theme.BorderDark
import com.example.ui.theme.BrandBlue
import com.example.ui.theme.CardDarkBg
import com.example.ui.theme.GainGreen
import com.example.ui.theme.GoldYellow
import com.example.ui.theme.LossRed
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NeonCyan
import com.example.ui.theme.TextGray
import com.example.ui.theme.TextWhite
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    MainScreen()
                }
            }
        }
    }
}

@Composable
fun MainScreen(viewModel: TradingViewModel = viewModel()) {
    val selectedTab by viewModel.selectedTab.collectAsState()
    val coins by viewModel.coins.collectAsState()
    val selectedSymbol by viewModel.selectedSymbol.collectAsState()

    val activeCoin = coins.find { it.symbol == selectedSymbol } ?: coins.firstOrNull()

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            BottomNavBar(
                selectedTab = selectedTab,
                onTabSelected = { viewModel.selectTab(it) }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(BaseDarkBg)
                .padding(innerPadding)
        ) {
            HeaderBar(activeCoin = activeCoin)

            Box(modifier = Modifier.fillMaxSize()) {
                when (selectedTab) {
                    0 -> MarketsTab(viewModel = viewModel, coins = coins, activeCoin = activeCoin)
                    1 -> TradeTab(viewModel = viewModel, activeCoin = activeCoin)
                    2 -> WalletTab(viewModel = viewModel, coins = coins)
                    3 -> AiAssistantTab(viewModel = viewModel, activeCoin = activeCoin)
                }
            }
        }
    }
}

@Composable
fun HeaderBar(activeCoin: Coin?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardDarkBg)
            .padding(horizontal = 16.dp, vertical = 14.dp)
            .border(width = 0.5.dp, color = BorderDark, shape = RoundedCornerShape(0.dp)),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Marium MEXC",
                    color = TextWhite,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.SansSerif
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(GainGreen, CircleShape)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "مباشر",
                    color = GainGreen,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            Text(
                text = "منصة تداول ذكية بالكامل",
                color = TextGray,
                fontSize = 11.sp
            )
        }

        if (activeCoin != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .background(BaseDarkBg, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "${activeCoin.symbol}/USDT",
                    color = TextWhite,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = String.format("%,.2f", activeCoin.price),
                    color = if (activeCoin.change24h >= 0) GainGreen else LossRed,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
fun BottomNavBar(selectedTab: Int, onTabSelected: (Int) -> Unit) {
    NavigationBar(
        containerColor = CardDarkBg,
        tonalElevation = 8.dp,
        modifier = Modifier.border(width = 0.5.dp, color = BorderDark, shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
    ) {
        NavigationBarItem(
            selected = selectedTab == 0,
            onClick = { onTabSelected(0) },
            icon = { Icon(Icons.Default.TrendingUp, contentDescription = "Markets") },
            label = { Text("الأسواق", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NeonCyan,
                selectedTextColor = NeonCyan,
                indicatorColor = BrandBlue,
                unselectedIconColor = TextGray,
                unselectedTextColor = TextGray
            ),
            modifier = Modifier.testTag("tab_markets")
        )
        NavigationBarItem(
            selected = selectedTab == 1,
            onClick = { onTabSelected(1) },
            icon = { Icon(Icons.Default.SwapHoriz, contentDescription = "Trade") },
            label = { Text("تداول", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NeonCyan,
                selectedTextColor = NeonCyan,
                indicatorColor = BrandBlue,
                unselectedIconColor = TextGray,
                unselectedTextColor = TextGray
            ),
            modifier = Modifier.testTag("tab_trade")
        )
        NavigationBarItem(
            selected = selectedTab == 2,
            onClick = { onTabSelected(2) },
            icon = { Icon(Icons.Default.Wallet, contentDescription = "Wallet") },
            label = { Text("المحفظة", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NeonCyan,
                selectedTextColor = NeonCyan,
                indicatorColor = BrandBlue,
                unselectedIconColor = TextGray,
                unselectedTextColor = TextGray
            ),
            modifier = Modifier.testTag("tab_wallet")
        )
        NavigationBarItem(
            selected = selectedTab == 3,
            onClick = { onTabSelected(3) },
            icon = { Icon(Icons.Default.SmartToy, contentDescription = "AI Assistant") },
            label = { Text("الذكاء الاصطناعي", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NeonCyan,
                selectedTextColor = NeonCyan,
                indicatorColor = BrandBlue,
                unselectedIconColor = TextGray,
                unselectedTextColor = TextGray
            ),
            modifier = Modifier.testTag("tab_ai")
        )
    }
}

@Composable
fun MarketsTab(viewModel: TradingViewModel, coins: List<Coin>, activeCoin: Coin?) {
    var searchQuery by remember { mutableStateOf("") }
    var showOnlyWatched by remember { mutableStateOf(false) }
    val watchlist by viewModel.watchlist.collectAsState()

    val filteredCoins = coins.filter {
        val matchesSearch = it.name.contains(searchQuery, ignoreCase = true) ||
                it.symbol.contains(searchQuery, ignoreCase = true)
        val matchesWatched = !showOnlyWatched || watchlist.any { item -> item.symbol == it.symbol }
        matchesSearch && matchesWatched
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("ابحث عن عملة... (مثال: BTC)", color = TextGray) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = TextGray) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("search_bar"),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite,
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = BorderDark,
                        focusedContainerColor = CardDarkBg,
                        unfocusedContainerColor = CardDarkBg
                    ),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Start
                ) {
                    Button(
                        onClick = { showOnlyWatched = false },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (!showOnlyWatched) BrandBlue else CardDarkBg,
                            contentColor = TextWhite
                        ),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.testTag("all_coins_toggle")
                    ) {
                        Text("الكل (${coins.size})", fontSize = 12.sp)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = { showOnlyWatched = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (showOnlyWatched) BrandBlue else CardDarkBg,
                            contentColor = TextWhite
                        ),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.testTag("watchlist_toggle")
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Favorite,
                                contentDescription = "Watchlist",
                                modifier = Modifier.size(14.dp),
                                tint = if (showOnlyWatched) NeonCyan else TextGray
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("المفضلة (${watchlist.size})", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "الأسعار الفورية وتحليل البيانات",
                    color = TextGray,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(GainGreen, CircleShape)
                    )
                    Text(
                        text = "مباشر (Binance)",
                        color = GainGreen,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        items(filteredCoins) { coin ->
            val isWatched = watchlist.any { it.symbol == coin.symbol }
            CoinTickerItem(
                coin = coin,
                isSelected = activeCoin?.symbol == coin.symbol,
                isWatched = isWatched,
                onSelect = { viewModel.selectSymbol(coin.symbol) },
                onWatchToggle = { viewModel.toggleWatchlist(coin.symbol) }
            )
        }

        if (activeCoin != null && filteredCoins.contains(activeCoin)) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                DetailedCoinCard(coin = activeCoin, viewModel = viewModel)
            }
        }
    }
}

@Composable
fun CoinTickerItem(
    coin: Coin,
    isSelected: Boolean,
    isWatched: Boolean,
    onSelect: () -> Unit,
    onWatchToggle: () -> Unit
) {
    val changeColor = if (coin.change24h >= 0) GainGreen else LossRed
    val borderClr = if (isSelected) NeonCyan else BorderDark

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .clickable { onSelect() }
            .testTag("coin_${coin.symbol}"),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) CardDarkBg.copy(alpha = 0.9f) else CardDarkBg
        ),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, borderClr)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1.5f)
            ) {
                IconButton(
                    onClick = onWatchToggle,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = if (isWatched) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Watch Toggle",
                        tint = if (isWatched) NeonCyan else TextGray,
                        modifier = Modifier.size(18.dp)
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(BrandBlue.copy(alpha = 0.8f), NeonCyan.copy(alpha = 0.8f))
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = coin.symbol.take(3),
                        color = TextWhite,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Text(
                        text = coin.name,
                        color = TextWhite,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${coin.symbol}/USDT",
                        color = TextGray,
                        fontSize = 11.sp
                    )
                }
            }

            SparklineChart(
                points = coin.sparkline,
                color = changeColor,
                modifier = Modifier
                    .width(70.dp)
                    .height(30.dp)
                    .weight(1f)
                    .padding(horizontal = 4.dp)
            )

            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.weight(1.2f)
            ) {
                Text(
                    text = String.format("%,.2f", coin.price),
                    color = TextWhite,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .background(
                            color = changeColor.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = String.format("%+.2f%%", coin.change24h),
                        color = changeColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}

@Composable
fun SparklineChart(
    points: List<Double>,
    color: Color,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        if (points.size < 2) return@Canvas
        val minVal = points.minOrNull() ?: 0.0
        val maxVal = points.maxOrNull() ?: 1.0
        val range = if (maxVal == minVal) 1.0 else (maxVal - minVal)

        val path = Path()
        val w = size.width
        val h = size.height
        val stepX = w / (points.size - 1)

        points.forEachIndexed { index, value ->
            val x = index * stepX
            val y = h - ((value - minVal) / range * h).toFloat()
            if (index == 0) {
                path.moveTo(x, y)
            } else {
                path.lineTo(x, y)
            }
        }

        val fillPath = Path().apply {
            addPath(path)
            lineTo(w, h)
            lineTo(0f, h)
            close()
        }
        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(color.copy(alpha = 0.15f), Color.Transparent),
                startY = 0f,
                endY = h
            )
        )

        drawPath(
            path = path,
            color = color,
            style = Stroke(width = 1.5.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}

@Composable
fun DetailedCoinCard(coin: Coin, viewModel: TradingViewModel) {
    var useCandlestick by remember { mutableStateOf(true) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("detailed_coin_card"),
        colors = CardDefaults.cardColors(containerColor = CardDarkBg),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, BorderDark)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = coin.name,
                        color = TextWhite,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "(${coin.symbol}/USDT)",
                        color = TextGray,
                        fontSize = 13.sp
                    )
                }

                Row(
                    modifier = Modifier
                        .background(BaseDarkBg, RoundedCornerShape(8.dp))
                        .padding(2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (useCandlestick) BrandBlue else Color.Transparent,
                                shape = RoundedCornerShape(6.dp)
                            )
                            .clickable { useCandlestick = true }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.BarChart,
                            contentDescription = "Candles",
                            tint = if (useCandlestick) TextWhite else TextGray,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (!useCandlestick) BrandBlue else Color.Transparent,
                                shape = RoundedCornerShape(6.dp)
                            )
                            .clickable { useCandlestick = false }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.ShowChart,
                            contentDescription = "Line",
                            tint = if (!useCandlestick) TextWhite else TextGray,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("أعلى سعر 24ساعة", color = TextGray, fontSize = 11.sp)
                    Text(
                        String.format("\$%,.2f", coin.high24h),
                        color = TextWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Column {
                    Text("أدنى سعر 24ساعة", color = TextGray, fontSize = 11.sp)
                    Text(
                        String.format("\$%,.2f", coin.low24h),
                        color = TextWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Column {
                    Text("حجم التداول", color = TextGray, fontSize = 11.sp)
                    Text(
                        String.format("%,.1f %s", coin.volume, coin.symbol),
                        color = TextWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(BaseDarkBg, RoundedCornerShape(12.dp))
                    .border(width = 0.5.dp, color = BorderDark, shape = RoundedCornerShape(12.dp))
                    .padding(12.dp),
                contentAlignment = Alignment.Center
            ) {
                if (useCandlestick) {
                    CandlestickChart(prices = coin.sparkline, modifier = Modifier.fillMaxSize())
                } else {
                    LineChart(prices = coin.sparkline, color = if (coin.change24h >= 0) GainGreen else LossRed, modifier = Modifier.fillMaxSize())
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Button(
                    onClick = {
                        viewModel.selectSymbol(coin.symbol)
                        viewModel.selectTab(1)
                    },
                    modifier = Modifier
                        .weight(1f)
                        .testTag("quick_trade_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = GainGreen),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("تداول الآن (${coin.symbol}/USDT)", color = BaseDarkBg, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.width(10.dp))

                Button(
                    onClick = {
                        viewModel.selectSymbol(coin.symbol)
                        viewModel.selectTab(3)
                        viewModel.askAiAssistant("قدم لي تحليلاً فنياً وتوقعات مبنية على البيانات لعملة ${coin.name} (${coin.symbol})")
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandBlue),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.SmartToy,
                            contentDescription = "AI",
                            modifier = Modifier.size(16.dp),
                            tint = TextWhite
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("تحليل الذكاء الاصطناعي", color = TextWhite)
                    }
                }
            }
        }
    }
}

@Composable
fun LineChart(prices: List<Double>, color: Color, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (prices.size < 2) return@Canvas
        val min = prices.minOrNull() ?: 0.0
        val max = prices.maxOrNull() ?: 1.0
        val range = if (max == min) 1.0 else (max - min)

        val path = Path()
        val stepX = size.width / (prices.size - 1)

        prices.forEachIndexed { i, p ->
            val x = i * stepX
            val y = size.height - ((p - min) / range * size.height).toFloat()
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }

        val gridLines = 4
        for (g in 1 until gridLines) {
            val yGrid = size.height * (g.toFloat() / gridLines)
            drawLine(
                color = BorderDark.copy(alpha = 0.5f),
                start = Offset(0f, yGrid),
                end = Offset(size.width, yGrid),
                strokeWidth = 1f
            )
        }

        val fillPath = Path().apply {
            addPath(path)
            lineTo(size.width, size.height)
            lineTo(0f, size.height)
            close()
        }
        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(color.copy(alpha = 0.25f), Color.Transparent),
                startY = 0f,
                endY = size.height
            )
        )

        drawPath(
            path = path,
            color = color,
            style = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}

data class CandleData(
    val open: Double,
    val close: Double,
    val high: Double,
    val low: Double
)

@Composable
fun CandlestickChart(prices: List<Double>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (prices.size < 4) return@Canvas
        
        val candles = mutableListOf<CandleData>()
        for (i in 0 until prices.size step 2) {
            val open = prices[i]
            val close = prices.getOrNull(i + 1) ?: open
            val scale = 0.0015
            val high = maxOf(open, close) * (1.0 + (i % 4 + 1) * scale)
            val low = minOf(open, close) * (1.0 - (i % 4 + 1) * scale)
            candles.add(CandleData(open, close, high, low))
        }

        val minVal = candles.minOf { it.low }
        val maxVal = candles.maxOf { it.high }
        val range = if (maxVal == minVal) 1.0 else (maxVal - minVal)

        val w = size.width
        val h = size.height
        val candleCount = candles.size
        val candleWidth = w / candleCount

        val gridLines = 4
        for (g in 1 until gridLines) {
            val yGrid = h * (g.toFloat() / gridLines)
            drawLine(
                color = BorderDark.copy(alpha = 0.5f),
                start = Offset(0f, yGrid),
                end = Offset(w, yGrid),
                strokeWidth = 1f
            )
        }

        candles.forEachIndexed { i, candle ->
            val isGreen = candle.close >= candle.open
            val color = if (isGreen) GainGreen else LossRed

            val x = i * candleWidth + candleWidth / 2f

            val yHigh = (h - ((candle.high - minVal) / range * h).toFloat())
            val yLow = (h - ((candle.low - minVal) / range * h).toFloat())
            val yOpen = (h - ((candle.open - minVal) / range * h).toFloat())
            val yClose = (h - ((candle.close - minVal) / range * h).toFloat())

            drawLine(
                color = color,
                start = Offset(x, yHigh),
                end = Offset(x, yLow),
                strokeWidth = 1.5.dp.toPx()
            )

            val topY = minOf(yOpen, yClose)
            val bottomY = maxOf(yOpen, yClose)
            val bodyHeight = maxOf(bottomY - topY, 4f)
            val bodyWidth = candleWidth * 0.65f

            drawRect(
                color = color,
                topLeft = Offset(x - bodyWidth / 2f, topY),
                size = Size(bodyWidth, bodyHeight)
            )
        }
    }
}

@Composable
fun TradeTab(viewModel: TradingViewModel, activeCoin: Coin?) {
    if (activeCoin == null) return

    val balance by viewModel.walletBalance.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val context = LocalContext.current

    var orderTypeIsBuy by remember { mutableStateOf(true) }
    var isLimitOrder by remember { mutableStateOf(false) }

    var inputPrice by remember(activeCoin.price, isLimitOrder) {
        mutableStateOf(String.format(Locale.US, "%.2f", activeCoin.price))
    }
    var inputAmount by remember { mutableStateOf("") }
    var percentageSlider by remember { mutableStateOf(0f) }

    val amountDouble = inputAmount.toDoubleOrNull() ?: 0.0
    val priceDouble = inputPrice.toDoubleOrNull() ?: activeCoin.price
    val totalCost = amountDouble * priceDouble

    val orderBookAsks = remember(activeCoin.price) {
        List(5) { i ->
            val p = activeCoin.price * (1.0 + (i + 1) * 0.0008)
            val v = Random.nextDouble(0.05, 1.8)
            p to v
        }.reversed()
    }
    val orderBookBids = remember(activeCoin.price) {
        List(5) { i ->
            val p = activeCoin.price * (1.0 - (i + 1) * 0.0008)
            val v = Random.nextDouble(0.05, 1.8)
            p to v
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "${activeCoin.symbol}/USDT",
                            color = TextWhite,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .background(
                                    color = if (activeCoin.change24h >= 0) GainGreen.copy(alpha = 0.15f) else LossRed.copy(alpha = 0.15f),
                                    shape = RoundedCornerShape(4.dp)
                                )
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = String.format("%+.2f%%", activeCoin.change24h),
                                color = if (activeCoin.change24h >= 0) GainGreen else LossRed,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                    Text(
                        text = String.format("%,.2f USDT", activeCoin.price),
                        color = TextWhite,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                IconButton(
                    onClick = {
                        viewModel.selectTab(3)
                        viewModel.askAiAssistant("برأيك كمحلل فني، هل الوقت مناسب الآن للقيام بصفقة ${if (orderTypeIsBuy) "شراء" else "بيع"} لعملة ${activeCoin.symbol} بسعر ${activeCoin.price}؟")
                    },
                    modifier = Modifier
                        .background(BrandBlue, CircleShape)
                        .size(40.dp)
                ) {
                    Icon(
                        Icons.Default.SmartToy,
                        contentDescription = "AI Tip",
                        modifier = Modifier.size(20.dp),
                        tint = TextWhite
                    )
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(
                    modifier = Modifier
                        .weight(1.2f)
                        .padding(end = 8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(BaseDarkBg, RoundedCornerShape(8.dp))
                            .border(width = 1.dp, color = BorderDark, shape = RoundedCornerShape(8.dp))
                            .padding(2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .background(
                                    color = if (orderTypeIsBuy) GainGreen else Color.Transparent,
                                    shape = RoundedCornerShape(6.dp)
                                )
                                .clickable {
                                    orderTypeIsBuy = true
                                    inputAmount = ""
                                    percentageSlider = 0f
                                }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "شراء",
                                color = if (orderTypeIsBuy) BaseDarkBg else TextGray,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .background(
                                    color = if (!orderTypeIsBuy) LossRed else Color.Transparent,
                                    shape = RoundedCornerShape(6.dp)
                                )
                                .clickable {
                                    orderTypeIsBuy = false
                                    inputAmount = ""
                                    percentageSlider = 0f
                                }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "بيع",
                                color = if (!orderTypeIsBuy) TextWhite else TextGray,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Button(
                            onClick = { isLimitOrder = false },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (!isLimitOrder) CardDarkBg else Color.Transparent,
                                contentColor = if (!isLimitOrder) NeonCyan else TextGray
                            ),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier
                                .weight(1f)
                                .border(
                                    1.dp,
                                    if (!isLimitOrder) NeonCyan else Color.Transparent,
                                    RoundedCornerShape(6.dp)
                                ),
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Text("بسعر السوق", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        Button(
                            onClick = { isLimitOrder = true },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isLimitOrder) CardDarkBg else Color.Transparent,
                                contentColor = if (isLimitOrder) NeonCyan else TextGray
                            ),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier
                                .weight(1f)
                                .border(
                                    1.dp,
                                    if (isLimitOrder) NeonCyan else Color.Transparent,
                                    RoundedCornerShape(6.dp)
                                ),
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Text("طلب حدّي", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (isLimitOrder) {
                        OutlinedTextField(
                            value = inputPrice,
                            onValueChange = { inputPrice = it },
                            label = { Text("السعر (USDT)", color = TextGray, fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextWhite,
                                unfocusedTextColor = TextWhite,
                                focusedBorderColor = NeonCyan,
                                unfocusedBorderColor = BorderDark,
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(CardDarkBg, RoundedCornerShape(8.dp))
                                .border(1.dp, BorderDark, RoundedCornerShape(8.dp))
                                .padding(horizontal = 12.dp, vertical = 10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("السعر السوقي", color = TextGray, fontSize = 11.sp)
                                Text("${activeCoin.price} USDT", color = TextWhite, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    OutlinedTextField(
                        value = inputAmount,
                        onValueChange = { inputAmount = it },
                        label = { Text("الكمية (${activeCoin.symbol})", color = TextGray, fontSize = 11.sp) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("amount_input"),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = BorderDark,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("النسبة المقدرة", color = TextGray, fontSize = 11.sp)
                            Text("${(percentageSlider * 100).toInt()}%", color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Slider(
                            value = percentageSlider,
                            onValueChange = {
                                percentageSlider = it
                                val maxTradeable = if (orderTypeIsBuy) {
                                    balance.usdt / priceDouble
                                } else {
                                    when (activeCoin.symbol) {
                                        "BTC" -> balance.btc
                                        "ETH" -> balance.eth
                                        "SOL" -> balance.sol
                                        "BNB" -> balance.bnb
                                        else -> 0.0
                                    }
                                }
                                val computedAmt = maxTradeable * it
                                inputAmount = if (computedAmt > 0) String.format(Locale.US, "%.5f", computedAmt) else ""
                            },
                            valueRange = 0f..1f,
                            colors = SliderDefaults.colors(
                                thumbColor = NeonCyan,
                                activeTrackColor = BrandBlue,
                                inactiveTrackColor = BorderDark
                            ),
                            modifier = Modifier.height(24.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("إجمالي التكلفة:", color = TextGray, fontSize = 11.sp)
                        Text(
                            text = String.format("%,.2f USDT", totalCost),
                            color = TextWhite,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    val availableText = if (orderTypeIsBuy) {
                        "المتاح: ${String.format("%,.2f", balance.usdt)} USDT"
                    } else {
                        val holding = when (activeCoin.symbol) {
                            "BTC" -> balance.btc
                            "ETH" -> balance.eth
                            "SOL" -> balance.sol
                            "BNB" -> balance.bnb
                            else -> 0.0
                        }
                        "المتاح: ${String.format("%,.4f", holding)} ${activeCoin.symbol}"
                    }
                    Text(
                        text = availableText,
                        color = TextGray,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Start,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Button(
                        onClick = {
                            val result = viewModel.placeOrder(
                                type = if (orderTypeIsBuy) "BUY" else "SELL",
                                amount = amountDouble,
                                price = priceDouble
                            )
                            Toast.makeText(context, result, Toast.LENGTH_LONG).show()
                            if (result.contains("بنجاح")) {
                                inputAmount = ""
                                percentageSlider = 0f
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("submit_order_button"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (orderTypeIsBuy) GainGreen else LossRed
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (orderTypeIsBuy) "شراء ${activeCoin.symbol}" else "بيع ${activeCoin.symbol}",
                            color = if (orderTypeIsBuy) BaseDarkBg else TextWhite,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }

                Column(
                    modifier = Modifier
                        .weight(0.8f)
                        .padding(start = 4.dp)
                        .background(CardDarkBg, RoundedCornerShape(12.dp))
                        .border(1.dp, BorderDark, RoundedCornerShape(12.dp))
                        .padding(8.dp)
                ) {
                    Text(
                        text = "دفتر الطلبات",
                        color = TextWhite,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("السعر", color = TextGray, fontSize = 9.sp)
                        Text("الكمية", color = TextGray, fontSize = 9.sp)
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    orderBookAsks.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 1.5.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                String.format("%.2f", item.first),
                                color = LossRed,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                String.format("%.3f", item.second),
                                color = TextWhite,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .background(BaseDarkBg, RoundedCornerShape(4.dp))
                            .padding(vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = String.format("%,.2f", activeCoin.price),
                            color = if (activeCoin.change24h >= 0) GainGreen else LossRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    orderBookBids.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 1.5.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                String.format("%.2f", item.first),
                                color = GainGreen,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                String.format("%.3f", item.second),
                                color = TextWhite,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 24.dp, bottom = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.History,
                    contentDescription = "History",
                    modifier = Modifier.size(18.dp),
                    tint = NeonCyan
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "سجل التداولات والعمليات الأخيرة",
                    color = TextWhite,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        if (transactions.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 20.dp)
                        .background(CardDarkBg, RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "لا توجد عمليات تداول سابقة حالياً. قم بوضع أول صفقة لتسجيلها في النظام.",
                        color = TextGray,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            items(transactions.take(15)) { tx ->
                TransactionRow(tx = tx)
            }
        }
    }
}

@Composable
fun TransactionRow(tx: TransactionItem) {
    val isBuy = tx.type == "BUY"
    val isDeposit = tx.type == "DEPOSIT"
    val badgeColor = when {
        isBuy -> GainGreen
        isDeposit -> NeonCyan
        else -> LossRed
    }
    val typeLabel = when {
        isBuy -> "شراء"
        isDeposit -> "شحن رصيد"
        else -> "بيع"
    }

    val sdf = remember { SimpleDateFormat("yyyy/MM/dd HH:mm", Locale.getDefault()) }
    val dateStr = sdf.format(Date(tx.timestamp))

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = CardDarkBg),
        border = BorderStroke(0.5.dp, BorderDark)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .background(badgeColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = typeLabel,
                        color = badgeColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Text(
                        text = if (isDeposit) "إيداع USDT" else "${tx.symbol}/USDT",
                        color = TextWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = dateStr,
                        color = TextGray,
                        fontSize = 10.sp
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = if (isDeposit) "" else "السعر: ${String.format("%,.2f", tx.price)} USDT",
                    color = TextGray,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "${if (isDeposit) "+" else ""}${String.format("%.4f", tx.amount)} ${tx.symbol}",
                    color = TextWhite,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "${String.format("%,.2f", tx.total)} USDT",
                    color = NeonCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
fun WalletTab(viewModel: TradingViewModel, coins: List<Coin>) {
    val balance by viewModel.walletBalance.collectAsState()

    var showDepositDialog by remember { mutableStateOf(false) }
    var showWithdrawDialog by remember { mutableStateOf(false) }

    val btcPrice = coins.find { it.symbol == "BTC" }?.price ?: 91000.0
    val ethPrice = coins.find { it.symbol == "ETH" }?.price ?: 3200.0
    val solPrice = coins.find { it.symbol == "SOL" }?.price ?: 180.0
    val bnbPrice = coins.find { it.symbol == "BNB" }?.price ?: 590.0

    val btcValue = balance.btc * btcPrice
    val ethValue = balance.eth * ethPrice
    val solValue = balance.sol * solPrice
    val bnbValue = balance.bnb * bnbPrice
    val totalEstUSDT = balance.usdt + btcValue + ethValue + solValue + bnbValue
    val totalEstBTC = if (btcPrice > 0.0) totalEstUSDT / btcPrice else 0.0

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("wallet_balance_card"),
                colors = CardDefaults.cardColors(containerColor = CardDarkBg),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, BorderDark)
            ) {
                Column(
                    modifier = Modifier
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(CardDarkBg, BaseDarkBg.copy(alpha = 0.5f))
                            )
                        )
                        .padding(20.dp)
                ) {
                    Text(
                        text = "القيمة الإجمالية المقدرة للمحفظة",
                        color = TextGray,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        verticalAlignment = Alignment.Bottom,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = String.format("%,.2f USDT", totalEstUSDT),
                            color = NeonCyan,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = String.format("≈ %,.5f BTC", totalEstBTC),
                            color = GoldYellow,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Button(
                            onClick = { showDepositDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = GainGreen),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("deposit_button")
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.ArrowUpward,
                                    contentDescription = "Deposit",
                                    modifier = Modifier.size(16.dp),
                                    tint = BaseDarkBg
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("إيداع سريع", color = BaseDarkBg, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Button(
                            onClick = { showWithdrawDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = LossRed),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("withdraw_button")
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.ArrowDownward,
                                    contentDescription = "Withdraw",
                                    modifier = Modifier.size(16.dp),
                                    tint = TextWhite
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("سحب الأموال", color = TextWhite, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "توزيع أصولك وتفاصيل الرصيد",
                color = TextWhite,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 24.dp, bottom = 12.dp)
            )
        }

        item {
            AssetBalanceRow(
                name = "Tether",
                symbol = "USDT",
                amount = balance.usdt,
                valueUsd = balance.usdt,
                percent = if (totalEstUSDT > 0.0) (balance.usdt / totalEstUSDT).toFloat() else 0f,
                accentColor = NeonCyan
            )
        }

        item {
            AssetBalanceRow(
                name = "Bitcoin",
                symbol = "BTC",
                amount = balance.btc,
                valueUsd = btcValue,
                percent = if (totalEstUSDT > 0.0) (btcValue / totalEstUSDT).toFloat() else 0f,
                accentColor = GoldYellow
            )
        }

        item {
            AssetBalanceRow(
                name = "Ethereum",
                symbol = "ETH",
                amount = balance.eth,
                valueUsd = ethValue,
                percent = if (totalEstUSDT > 0.0) (ethValue / totalEstUSDT).toFloat() else 0f,
                accentColor = Color(0xFF9FA8DA)
            )
        }

        item {
            AssetBalanceRow(
                name = "Solana",
                symbol = "SOL",
                amount = balance.sol,
                valueUsd = solValue,
                percent = if (totalEstUSDT > 0.0) (solValue / totalEstUSDT).toFloat() else 0f,
                accentColor = Color(0xFF80CBC4)
            )
        }

        item {
            AssetBalanceRow(
                name = "Binance Coin",
                symbol = "BNB",
                amount = balance.bnb,
                valueUsd = bnbValue,
                percent = if (totalEstUSDT > 0.0) (bnbValue / totalEstUSDT).toFloat() else 0f,
                accentColor = Color(0xFFFFB74D)
            )
        }
    }

    if (showDepositDialog) {
        var depositAmount by remember { mutableStateOf("1000") }
        Dialog(onDismissRequest = { showDepositDialog = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = CardDarkBg),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, BorderDark)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("إيداع تجريبي سريع (USDT)", color = TextWhite, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("ستتم إضافة المبلغ فوراً وبشكل مجاني كلياً لمحفظتك لمحاكاة عمليات التداول الحية.", color = TextGray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = depositAmount,
                        onValueChange = { depositAmount = it },
                        label = { Text("المبلغ المودع (USDT)", color = TextGray) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = BorderDark,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(
                            onClick = { showDepositDialog = false },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = TextGray)
                        ) {
                            Text("إلغاء")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                val amt = depositAmount.toDoubleOrNull() ?: 0.0
                                if (amt > 0) {
                                    viewModel.depositUSDT(amt)
                                    showDepositDialog = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = GainGreen)
                        ) {
                            Text("تأكيد الإيداع", color = BaseDarkBg, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    if (showWithdrawDialog) {
        var withdrawAmount by remember { mutableStateOf("") }
        var withdrawAddress by remember { mutableStateOf("") }
        val context = LocalContext.current

        Dialog(onDismissRequest = { showWithdrawDialog = false }) {
            Card(
                colors = CardDefaults.cardColors(containerColor = CardDarkBg),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, BorderDark)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("سحب الأموال المقدرة (USDT)", color = TextWhite, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("رصيدك الحالي المتاح للسحب هو ${String.format("%,.2f", balance.usdt)} USDT.", color = TextGray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = withdrawAmount,
                        onValueChange = { withdrawAmount = it },
                        label = { Text("المبلغ المسحوب (USDT)", color = TextGray) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = BorderDark,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = withdrawAddress,
                        onValueChange = { withdrawAddress = it },
                        label = { Text("عنوان محفظة المستلم (TRC20 / ERC20)", color = TextGray) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextWhite,
                            unfocusedTextColor = TextWhite,
                            focusedBorderColor = NeonCyan,
                            unfocusedBorderColor = BorderDark,
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(
                            onClick = { showWithdrawDialog = false },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = TextGray)
                        ) {
                            Text("إلغاء")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                val amt = withdrawAmount.toDoubleOrNull() ?: 0.0
                                if (amt <= 0.0) {
                                    Toast.makeText(context, "الرجاء إدخال مبلغ صالح.", Toast.LENGTH_SHORT).show()
                                } else if (amt > balance.usdt) {
                                    Toast.makeText(context, "رصيدك غير كافٍ للقيام بهذه العملية.", Toast.LENGTH_SHORT).show()
                                } else if (withdrawAddress.isBlank()) {
                                    Toast.makeText(context, "الرجاء إدخال عنوان محفظة صالح.", Toast.LENGTH_SHORT).show()
                                } else {
                                    viewModel.depositUSDT(-amt)
                                    Toast.makeText(context, "تم إرسال طلب السحب لمعالجة البلوكشين بنجاح!", Toast.LENGTH_LONG).show()
                                    showWithdrawDialog = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = LossRed)
                        ) {
                            Text("سحب الآن", color = TextWhite, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AssetBalanceRow(
    name: String,
    symbol: String,
    amount: Double,
    valueUsd: Double,
    percent: Float,
    accentColor: Color
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        colors = CardDefaults.cardColors(containerColor = CardDarkBg),
        border = BorderStroke(0.5.dp, BorderDark)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(accentColor, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = name, color = TextWhite, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "($symbol)", color = TextGray, fontSize = 11.sp)
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "${String.format("%.4f", amount)} $symbol",
                        color = TextWhite,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = String.format("≈ %,.2f USDT", valueUsd),
                        color = TextGray,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                LinearProgressIndicator(
                    progress = { percent },
                    modifier = Modifier
                        .weight(1f)
                        .height(5.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = accentColor,
                    trackColor = BorderDark
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = String.format("%.1f%%", percent * 100),
                    color = TextGray,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
fun AiAssistantTab(viewModel: TradingViewModel, activeCoin: Coin?) {
    val chatHistory by viewModel.aiChatHistory.collectAsState()
    val isAiLoading by viewModel.isAiLoading.collectAsState()

    var inputQuery by remember { mutableStateOf("") }

    val quickQuestions = listOf(
        "هل الوقت مناسب للشراء؟",
        "شرح مؤشر RSI والـ MACD",
        "توقعات البيتكوين BTC القادمة",
        "أفضل استراتيجية لإدارة المخاطر"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            reverseLayout = false
        ) {
            items(chatHistory) { item ->
                ChatBubble(message = item.first, isUser = item.second)
            }

            if (isAiLoading) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            color = NeonCyan,
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("مساعد التداول يحلل البيانات الآن...", color = TextGray, fontSize = 11.sp)
                    }
                }
            }
        }

        Text(
            text = "أسئلة شائعة مقترحة:",
            color = TextGray,
            fontSize = 11.sp,
            modifier = Modifier.padding(vertical = 4.dp)
        )
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(quickQuestions) { query ->
                Box(
                    modifier = Modifier
                        .background(CardDarkBg, RoundedCornerShape(16.dp))
                        .border(0.5.dp, BorderDark, RoundedCornerShape(16.dp))
                        .clickable { viewModel.askAiAssistant(query) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(text = query, color = NeonCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { viewModel.clearChat() },
                modifier = Modifier
                    .background(CardDarkBg, CircleShape)
                    .size(46.dp)
            ) {
                Icon(Icons.Default.DeleteOutline, contentDescription = "Clear History", tint = LossRed)
            }

            Spacer(modifier = Modifier.width(8.dp))

            OutlinedTextField(
                value = inputQuery,
                onValueChange = { inputQuery = it },
                placeholder = { Text("اسأل الذكاء الاصطناعي ماريوم...", color = TextGray, fontSize = 13.sp) },
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input"),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = TextWhite,
                    unfocusedTextColor = TextWhite,
                    focusedBorderColor = NeonCyan,
                    unfocusedBorderColor = BorderDark,
                    focusedContainerColor = CardDarkBg,
                    unfocusedContainerColor = CardDarkBg
                ),
                shape = RoundedCornerShape(24.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputQuery.isNotBlank()) {
                        viewModel.askAiAssistant(inputQuery)
                        inputQuery = ""
                    }
                },
                modifier = Modifier
                    .background(BrandBlue, CircleShape)
                    .size(46.dp)
                    .testTag("chat_send_button")
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send Message", tint = TextWhite)
            }
        }
    }
}

@Composable
fun ChatBubble(message: String, isUser: Boolean) {
    val align = if (isUser) Alignment.End else Alignment.Start
    val bg = if (isUser) BrandBlue else CardDarkBg
    val borderClr = if (isUser) Color.Transparent else BorderDark
    val label = if (isUser) "أنت" else "مساعد الذكاء الاصطناعي (ماريوم)"
    val labelColor = if (isUser) NeonCyan else GoldYellow

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalAlignment = align
    ) {
        Text(
            text = label,
            color = labelColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 6.dp, end = 6.dp, bottom = 2.dp)
        )
        Box(
            modifier = Modifier
                .clip(
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isUser) 16.dp else 2.dp,
                        bottomEnd = if (isUser) 2.dp else 16.dp
                    )
                )
                .background(bg)
                .border(
                    width = 0.5.dp,
                    color = borderClr,
                    shape = RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isUser) 16.dp else 2.dp,
                        bottomEnd = if (isUser) 2.dp else 16.dp
                    )
                )
                .padding(14.dp)
                .widthIn(max = 280.dp)
        ) {
            Text(
                text = message,
                color = TextWhite,
                fontSize = 13.sp,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
fun BorderStroke(width: androidx.compose.ui.unit.Dp, color: Color) =
    androidx.compose.foundation.BorderStroke(width, color)
