package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = BrandBlue,
    secondary = NeonCyan,
    background = BaseDarkBg,
    surface = CardDarkBg,
    onPrimary = TextWhite,
    onSecondary = BaseDarkBg,
    onBackground = TextWhite,
    onSurface = TextWhite,
    outline = BorderDark
)

@Composable
fun MyApplicationTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
