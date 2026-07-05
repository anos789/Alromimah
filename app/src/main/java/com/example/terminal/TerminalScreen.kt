package com.example.terminal

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import kotlin.random.Random

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TerminalScreen(viewModel: TerminalViewModel = viewModel()) {
    val history by viewModel.history.collectAsState()
    val currentDirPrompt by viewModel.currentDirPrompt.collectAsState()
    val currentThemeName by viewModel.currentTheme.collectAsState()
    val matrixActive by viewModel.matrixActive.collectAsState()

    val (themeColor, backgroundColor, accentColor) = getThemeColors(currentThemeName)

    if (matrixActive) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
        ) {
            MatrixScreensaver(colorTheme = themeColor) {
                viewModel.exitMatrix()
            }
        }
    } else {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Terminal,
                                contentDescription = null,
                                tint = themeColor,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "RETRO-SH v1.2",
                                color = themeColor,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = backgroundColor
                    ),
                    actions = {
                        var expandedThemeMenu by remember { mutableStateOf(false) }
                        IconButton(onClick = { expandedThemeMenu = true }) {
                            Icon(
                                imageVector = Icons.Default.Palette,
                                contentDescription = "Themes",
                                tint = themeColor
                            )
                        }
                        DropdownMenu(
                            expanded = expandedThemeMenu,
                            onDismissRequest = { expandedThemeMenu = false },
                            modifier = Modifier.background(backgroundColor).border(1.dp, accentColor)
                        ) {
                            listOf("green", "amber", "cyan", "slate").forEach { theme ->
                                DropdownMenuItem(
                                    text = { 
                                        Text(
                                            theme.uppercase(), 
                                            color = themeColor, 
                                            fontFamily = FontFamily.Monospace,
                                            fontSize = 12.sp
                                        ) 
                                    },
                                    onClick = {
                                        viewModel.executeCommand("theme $theme")
                                        expandedThemeMenu = false
                                    }
                                )
                            }
                        }
                    }
                )
            },
            bottomBar = {
                // Shortcut Hotkey row
                Column(
                    modifier = Modifier
                        .background(backgroundColor)
                        .padding(bottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding())
                ) {
                    HorizontalDivider(color = accentColor.copy(alpha = 0.5f))
                    
                    // Input Bar & Action Row
                    Box(modifier = Modifier.fillMaxWidth()) {
                        TerminalInputRow(
                            themeColor = themeColor,
                            backgroundColor = backgroundColor,
                            currentDirPrompt = currentDirPrompt,
                            onSubmit = { viewModel.executeCommand(it) },
                            onTab = { partial -> viewModel.attemptTabCompletion(partial) },
                            onHistoryCycle = { up -> viewModel.cycleCommandHistory(up) }
                        )
                    }
                }
            },
            containerColor = backgroundColor
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(backgroundColor)
            ) {
                // Console output scroll container
                val listState = rememberLazyListState()
                
                LaunchedEffect(history.size) {
                    if (history.isNotEmpty()) {
                        listState.animateScrollToItem(history.size - 1)
                    }
                }

                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(history) { line ->
                        when (line.type) {
                            LineType.INPUT -> {
                                Text(
                                    text = "user@retro-sh:$currentDirPrompt$ ${line.text}",
                                    color = themeColor.copy(alpha = 0.85f),
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            else -> {
                                Text(
                                    text = line.text,
                                    color = when (line.type) {
                                        LineType.ERROR -> Color(0xFFEF4444)
                                        LineType.SUCCESS -> Color(0xFF22C55E)
                                        LineType.SYSTEM -> themeColor.copy(alpha = 0.7f)
                                        LineType.GEMINI -> Color(0xFFA855F7) // Purple glow
                                        else -> themeColor
                                    },
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }

                // CRT screen scan lines overlay
                ScanLinesOverlay(color = themeColor)
            }
        }
    }
}

@Composable
fun TerminalInputRow(
    themeColor: Color,
    backgroundColor: Color,
    currentDirPrompt: String,
    onSubmit: (String) -> Unit,
    onTab: (String) -> String,
    onHistoryCycle: (Boolean) -> String
) {
    var textState by remember { mutableStateOf("") }
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current

    Column {
        // Developer Quick Hotkeys Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(backgroundColor.copy(alpha = 0.9f))
                .horizontalScroll(rememberScrollState())
                .padding(vertical = 8.dp, horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Functional Helpers
            HotkeyButton(text = "Tab", themeColor = themeColor) {
                val completed = onTab(textState)
                if (completed.isNotEmpty()) {
                    textState = completed
                }
            }
            HotkeyButton(text = "▲", themeColor = themeColor) {
                val historyCommand = onHistoryCycle(true)
                if (historyCommand.isNotEmpty()) {
                    textState = historyCommand
                }
            }
            HotkeyButton(text = "▼", themeColor = themeColor) {
                val historyCommand = onHistoryCycle(false)
                textState = historyCommand
            }

            // Commands
            HotkeyButton(text = "ls", themeColor = themeColor) { textState = "ls" }
            HotkeyButton(text = "cd ", themeColor = themeColor) { textState = "cd " }
            HotkeyButton(text = "cat ", themeColor = themeColor) { textState = "cat " }
            HotkeyButton(text = "neofetch", themeColor = themeColor) { textState = "neofetch" }
            HotkeyButton(text = "matrix", themeColor = themeColor) { textState = "matrix" }
            HotkeyButton(text = "gemini ", themeColor = themeColor) { textState = "gemini " }
            HotkeyButton(text = "clear", themeColor = themeColor) { textState = "clear" }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(backgroundColor)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    focusRequester.requestFocus()
                    keyboardController?.show()
                }
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Invisible Text Field taking all space
            Box(modifier = Modifier.weight(1f)) {
                BasicTextField(
                    value = textState,
                    onValueChange = { textState = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester)
                        .alpha(0f), // Invisible so we draw custom styling
                    keyboardOptions = KeyboardOptions(
                        capitalization = KeyboardCapitalization.None,
                        autoCorrectEnabled = false,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            onSubmit(textState)
                            textState = ""
                            keyboardController?.hide()
                        }
                    )
                )

                // Custom Render Row showing terminal prompt, typed text, and blinking block cursor
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "user@retro-sh:$currentDirPrompt$ ",
                        color = themeColor,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = textState,
                        color = themeColor,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp
                    )
                    BlinkingCursor(color = themeColor)
                }
            }

            // Running command button icon
            IconButton(
                onClick = {
                    onSubmit(textState)
                    textState = ""
                    keyboardController?.hide()
                },
                modifier = Modifier.size(24.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Execute Command",
                    tint = themeColor,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

@Composable
fun HotkeyButton(
    text: String,
    themeColor: Color,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .border(1.dp, themeColor.copy(alpha = 0.5f), RoundedCornerShape(4.dp))
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 6.dp)
    ) {
        Text(
            text = text,
            color = themeColor,
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun BlinkingCursor(color: Color) {
    val infiniteTransition = rememberInfiniteTransition(label = "cursor")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursorAlpha"
    )
    Box(
        modifier = Modifier
            .size(width = 8.dp, height = 15.dp)
            .background(color.copy(alpha = alpha))
    )
}

@Composable
fun ScanLinesOverlay(color: Color, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.fillMaxSize()) {
        val strokeWidth = 1.dp.toPx()
        val step = 4.dp.toPx()
        var y = 0f
        while (y < size.height) {
            drawLine(
                color = color.copy(alpha = 0.05f),
                start = androidx.compose.ui.geometry.Offset(0f, y),
                end = androidx.compose.ui.geometry.Offset(size.width, y),
                strokeWidth = strokeWidth
            )
            y += step
        }
    }
}

@Composable
fun MatrixScreensaver(
    colorTheme: Color,
    onExit: () -> Unit
) {
    var tick by remember { mutableStateOf(0L) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(40)
            tick++
        }
    }

    val characters = remember {
        "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray()
    }

    var columns by remember { mutableStateOf<List<MatrixColumn>?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .clickable { onExit() }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            val fontSize = 35f
            val colWidth = fontSize * 0.8f
            val numCols = (width / colWidth).toInt() + 1

            if (columns == null || columns!!.size != numCols) {
                columns = List(numCols) {
                    MatrixColumn(
                        y = Random.nextFloat() * -height,
                        speed = Random.nextFloat() * 10f + 5f,
                        chars = List(25) { characters[Random.nextInt(characters.size)] }
                    )
                }
            }

            val paint = android.graphics.Paint().apply {
                color = colorTheme.hashCode()
                textSize = fontSize
                typeface = android.graphics.Typeface.MONOSPACE
                isAntiAlias = true
            }

            drawIntoCanvas { canvas ->
                val nativeCanvas = canvas.nativeCanvas
                val currentCols = columns ?: return@drawIntoCanvas

                val updatedCols = currentCols.mapIndexed { colIndex, col ->
                    val currentY = col.y
                    val colX = colIndex * colWidth

                    col.chars.forEachIndexed { charIndex, char ->
                        val charY = currentY - (charIndex * fontSize)
                        if (charY in 0f..height) {
                            val alpha = when (charIndex) {
                                0 -> 255
                                1 -> 220
                                2 -> 180
                                else -> (140 - (charIndex * 5)).coerceAtLeast(15)
                            }
                            paint.color = if (charIndex == 0) {
                                android.graphics.Color.WHITE
                            } else {
                                val c = colorTheme
                                android.graphics.Color.argb(
                                    alpha,
                                    (c.red * 255).toInt(),
                                    (c.green * 255).toInt(),
                                    (c.blue * 255).toInt()
                                )
                            }
                            nativeCanvas.drawText(char.toString(), colX, charY, paint)
                        }
                    }

                    val nextY = currentY + col.speed
                    if (nextY - (col.chars.size * fontSize) > height) {
                        MatrixColumn(
                            y = Random.nextFloat() * -300f,
                            speed = Random.nextFloat() * 8f + 4f,
                            chars = List(Random.nextInt(15, 28)) { characters[Random.nextInt(characters.size)] }
                        )
                    } else {
                        val updatedChars = col.chars.map {
                            if (Random.nextFloat() < 0.04f) characters[Random.nextInt(characters.size)] else it
                        }
                        col.copy(y = nextY, chars = updatedChars)
                    }
                }
                columns = updatedCols
            }
        }

        Text(
            text = "TAP SCREEN TO TERMINATE MATRIX",
            color = colorTheme.copy(alpha = 0.5f),
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
        )
    }
}

data class MatrixColumn(
    val y: Float,
    val speed: Float,
    val chars: List<Char>
)

fun getThemeColors(themeName: String): Triple<Color, Color, Color> {
    return when (themeName) {
        "phosphor_green" -> Triple(
            Color(0xFF00FF33),
            Color(0xFF050B06),
            Color(0xFF103A12)
        )
        "phosphor_amber" -> Triple(
            Color(0xFFFFB000),
            Color(0xFF0D0702),
            Color(0xFF3D1B04)
        )
        "phosphor_cyan" -> Triple(
            Color(0xFF00E5FF),
            Color(0xFF030A0D),
            Color(0xFF0B2F3D)
        )
        "phosphor_slate" -> Triple(
            Color(0xFFE2E8F0),
            Color(0xFF0F172A),
            Color(0xFF334155)
        )
        else -> Triple(
            Color(0xFF00FF33),
            Color(0xFF050B06),
            Color(0xFF103A12)
        )
    }
}
