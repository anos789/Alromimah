package com.example.terminal

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

enum class LineType {
    INPUT,
    OUTPUT,
    ERROR,
    SUCCESS,
    SYSTEM,
    GEMINI
}

data class TerminalLine(
    val text: String,
    val type: LineType,
    val timestamp: Long = System.currentTimeMillis()
)

class TerminalViewModel : ViewModel() {

    private val vfs = VirtualFileSystem()

    private val _history = MutableStateFlow<List<TerminalLine>>(emptyList())
    val history: StateFlow<List<TerminalLine>> = _history.asStateFlow()

    private val _currentDirPrompt = MutableStateFlow("~")
    val currentDirPrompt: StateFlow<String> = _currentDirPrompt.asStateFlow()

    private val _currentTheme = MutableStateFlow("phosphor_green")
    val currentTheme: StateFlow<String> = _currentTheme.asStateFlow()

    private val _matrixActive = MutableStateFlow(false)
    val matrixActive: StateFlow<Boolean> = _matrixActive.asStateFlow()

    private val _commandHistory = MutableStateFlow<List<String>>(emptyList())
    val commandHistory: StateFlow<List<String>> = _commandHistory.asStateFlow()

    private val _historyIndex = MutableStateFlow(0)

    init {
        // Welcome message on startup
        _history.value = listOf(
            TerminalLine("==================================================", LineType.SYSTEM),
            TerminalLine("     RETRO TERMINAL SYSTEM OPERATING ENVIRONMENT   ", LineType.SYSTEM),
            TerminalLine("==================================================", LineType.SYSTEM),
            TerminalLine("Device status: ONLINE", LineType.SUCCESS),
            TerminalLine("VFS mounting: /dev/vfs01 mounted at /home/user", LineType.SUCCESS),
            TerminalLine("Type 'help' to see a list of system commands.", LineType.SYSTEM),
            TerminalLine("Type 'gemini <prompt>' to query retro AI helper.", LineType.SYSTEM),
            TerminalLine("--------------------------------------------------", LineType.SYSTEM)
        )
    }

    fun exitMatrix() {
        _matrixActive.value = false
    }

    fun cycleCommandHistory(up: Boolean): String {
        val size = _commandHistory.value.size
        if (size == 0) return ""

        var newIndex = _historyIndex.value + if (up) -1 else 1
        if (newIndex < 0) {
            newIndex = 0
        } else if (newIndex >= size) {
            newIndex = size
            _historyIndex.value = size
            return ""
        }

        _historyIndex.value = newIndex
        return _commandHistory.value[newIndex]
    }

    fun attemptTabCompletion(partialInput: String): String {
        if (partialInput.isEmpty()) return ""
        val parts = partialInput.split(" ")
        if (parts.isEmpty()) return partialInput

        val cmd = parts[0].lowercase()
        // If they are autocomplete-ing files or cd directories
        if (parts.size == 1) {
            // Match commands
            val commandsList = listOf(
                "help", "clear", "neofetch", "ls", "cd", "pwd", "cat", 
                "mkdir", "touch", "rm", "echo", "whoami", "date", "matrix", "theme", "gemini", "history"
            )
            val matched = commandsList.firstOrNull { it.startsWith(cmd) && it != cmd }
            if (matched != null) {
                return matched
            }
        } else if (parts.size == 2 && (cmd == "cd" || cmd == "cat" || cmd == "rm")) {
            val filePrefix = parts[1]
            val items = vfs.listDir() ?: emptyList()
            val matchedNode = items.firstOrNull { it.name.startsWith(filePrefix) }
            if (matchedNode != null) {
                val suffix = if (matchedNode is VDirectory) "/" else ""
                return "$cmd ${matchedNode.name}$suffix"
            }
        }
        return partialInput
    }

    fun executeCommand(rawInput: String) {
        val trimmed = rawInput.trim()
        if (trimmed.isEmpty()) {
            _history.value = _history.value + TerminalLine("", LineType.INPUT)
            return
        }

        // Add to view scroll history and cycle queue
        _history.value = _history.value + TerminalLine(trimmed, LineType.INPUT)
        _commandHistory.value = _commandHistory.value + trimmed
        _historyIndex.value = _commandHistory.value.size

        // Parse redirection
        var commandToRun = trimmed
        var redirectFile: String? = null
        var appendMode = false

        if (trimmed.contains(" >> ")) {
            val parts = trimmed.split(" >> ", limit = 2)
            commandToRun = parts[0].trim()
            redirectFile = parts[1].trim()
            appendMode = true
        } else if (trimmed.contains(" > ")) {
            val parts = trimmed.split(" > ", limit = 2)
            commandToRun = parts[0].trim()
            redirectFile = parts[1].trim()
            appendMode = false
        }

        val tokens = commandToRun.split(" ").filter { it.isNotEmpty() }
        if (tokens.isEmpty()) return

        val cmd = tokens[0].lowercase()
        val args = tokens.drop(1)

        val outputBuffer = StringBuilder()
        var outputType = LineType.OUTPUT

        when (cmd) {
            "help" -> {
                outputBuffer.append("Retro Terminal OS - Available Commands:\n")
                outputBuffer.append("  help                  Display this helper guide\n")
                outputBuffer.append("  clear                 Clear terminal scroll buffer\n")
                outputBuffer.append("  neofetch              Display retro system specifications\n")
                outputBuffer.append("  ls [path]             List files/folders in directory\n")
                outputBuffer.append("  cd <path>             Change current working directory\n")
                outputBuffer.append("  pwd                   Print current working directory\n")
                outputBuffer.append("  cat <file>            Display text file contents\n")
                outputBuffer.append("  mkdir <name>          Create a new directory\n")
                outputBuffer.append("  touch <name>          Create a new empty text file\n")
                outputBuffer.append("  rm <name>             Remove file or directory\n")
                outputBuffer.append("  echo [text]           Print text to console (supports > and >>)\n")
                outputBuffer.append("  whoami                Show logged-in user details\n")
                outputBuffer.append("  date                  Print current system date & time\n")
                outputBuffer.append("  matrix                Launch retro digital rain screen\n")
                outputBuffer.append("  theme <color>         Set theme: green | amber | cyan | slate\n")
                outputBuffer.append("  gemini <prompt>       Query retro terminal AI core\n")
                outputBuffer.append("  history               Show previous commands history\n")
            }
            "clear" -> {
                _history.value = emptyList()
                return
            }
            "pwd" -> {
                outputBuffer.append(vfs.currentDirPath)
            }
            "whoami" -> {
                outputBuffer.append("user@android-retro-terminal")
            }
            "date" -> {
                outputBuffer.append(java.util.Date().toString())
            }
            "history" -> {
                _commandHistory.value.forEachIndexed { idx, h ->
                    outputBuffer.append(String.format("  %3d  %s\n", idx + 1, h))
                }
            }
            "ls" -> {
                val targetPath = args.firstOrNull() ?: vfs.currentDirPath
                val contents = vfs.listDir(targetPath)
                if (contents == null) {
                    outputBuffer.append("ls: cannot access '$targetPath': No such directory")
                    outputType = LineType.ERROR
                } else {
                    if (contents.isEmpty()) {
                        outputBuffer.append("(empty directory)")
                    } else {
                        val result = contents.joinToString("\n") { node ->
                            if (node is VDirectory) {
                                "📁 ${node.name}/"
                            } else {
                                "📄 ${node.name}"
                            }
                        }
                        outputBuffer.append(result)
                    }
                }
            }
            "cd" -> {
                val targetPath = args.firstOrNull() ?: "~"
                val success = vfs.changeDir(targetPath)
                if (!success) {
                    outputBuffer.append("cd: no such file or directory: $targetPath")
                    outputType = LineType.ERROR
                } else {
                    _currentDirPrompt.value = vfs.getPromptPath()
                }
            }
            "cat" -> {
                val targetFile = args.firstOrNull()
                if (targetFile == null) {
                    outputBuffer.append("cat: missing file operand")
                    outputType = LineType.ERROR
                } else {
                    val node = vfs.getNode(targetFile)
                    if (node == null) {
                        outputBuffer.append("cat: $targetFile: No such file")
                        outputType = LineType.ERROR
                    } else if (node is VDirectory) {
                        outputBuffer.append("cat: $targetFile: Is a directory")
                        outputType = LineType.ERROR
                    } else if (node is VFile) {
                        outputBuffer.append(node.content)
                    }
                }
            }
            "mkdir" -> {
                val name = args.firstOrNull()
                if (name == null) {
                    outputBuffer.append("mkdir: missing operand")
                    outputType = LineType.ERROR
                } else {
                    val success = vfs.mkdir(name)
                    if (!success) {
                        outputBuffer.append("mkdir: cannot create directory '$name': File exists or path invalid")
                        outputType = LineType.ERROR
                    } else {
                        outputBuffer.append("Directory '$name' created.")
                        outputType = LineType.SUCCESS
                    }
                }
            }
            "touch" -> {
                val name = args.firstOrNull()
                if (name == null) {
                    outputBuffer.append("touch: missing file operand")
                    outputType = LineType.ERROR
                } else {
                    val success = vfs.touch(name)
                    if (!success) {
                        outputBuffer.append("touch: cannot create file '$name': Path invalid")
                        outputType = LineType.ERROR
                    } else {
                        outputBuffer.append("File '$name' created.")
                        outputType = LineType.SUCCESS
                    }
                }
            }
            "rm" -> {
                val name = args.firstOrNull()
                if (name == null) {
                    outputBuffer.append("rm: missing operand")
                    outputType = LineType.ERROR
                } else {
                    val success = vfs.rm(name)
                    if (!success) {
                        outputBuffer.append("rm: cannot remove '$name': No such file/directory or protected")
                        outputType = LineType.ERROR
                    } else {
                        outputBuffer.append("Removed '$name'.")
                        outputType = LineType.SUCCESS
                    }
                }
            }
            "echo" -> {
                val text = args.joinToString(" ")
                outputBuffer.append(text)
            }
            "neofetch" -> {
                val neofetchText = """
${getASCIIHeader()}
----------------------------------
OS: RetroTerminal OS v1.0.4
Kernel: Linux 5.10.0-aistudio-retro
Uptime: 2 hours, 14 mins
Shell: retrosh 1.2
Terminal: Android Console Compose
CPU: Snapdragon Retro-8 (8 Core)
Memory: 6.2 GB / 8.0 GB (77%)
Screen: 1080x2400 (Fluid AMOLED)
Theme: ${_currentTheme.value.replace("_", " ").uppercase()}
                """.trimIndent()
                outputBuffer.append(neofetchText)
                outputType = LineType.SYSTEM
            }
            "matrix" -> {
                _matrixActive.value = true
                return
            }
            "theme" -> {
                val targetTheme = args.firstOrNull()?.lowercase()
                if (targetTheme == "green" || targetTheme == "amber" || targetTheme == "cyan" || targetTheme == "slate") {
                    _currentTheme.value = "phosphor_$targetTheme"
                    outputBuffer.append("Theme changed to phosphor_$targetTheme.")
                    outputType = LineType.SUCCESS
                } else {
                    outputBuffer.append("theme: invalid theme. Options: green | amber | cyan | slate")
                    outputType = LineType.ERROR
                }
            }
            "gemini" -> {
                val prompt = args.joinToString(" ")
                if (prompt.isEmpty()) {
                    outputBuffer.append("gemini: missing AI query prompt")
                    outputType = LineType.ERROR
                } else {
                    runGeminiCommand(prompt)
                    return
                }
            }
            else -> {
                outputBuffer.append("retrosh: command not found: $cmd. Type 'help' for support.")
                outputType = LineType.ERROR
            }
        }

        if (redirectFile != null) {
            val textToSave = outputBuffer.toString()
            val success = if (appendMode) {
                val existing = vfs.getNode(redirectFile)
                val content = if (existing is VFile) existing.content + "\n" + textToSave else textToSave
                vfs.touch(redirectFile, content)
            } else {
                vfs.touch(redirectFile, textToSave)
            }
            if (success) {
                _history.value = _history.value + TerminalLine("Output written to '$redirectFile'.", LineType.SUCCESS)
            } else {
                _history.value = _history.value + TerminalLine("echo: failed to write to file '$redirectFile'.", LineType.ERROR)
            }
        } else {
            _history.value = _history.value + TerminalLine(outputBuffer.toString(), outputType)
        }
    }

    private fun runGeminiCommand(prompt: String) {
        viewModelScope.launch {
            val loadingLine = TerminalLine("Connecting to Gemini AI Terminal Core...", LineType.SYSTEM)
            _history.value = _history.value + loadingLine

            val aiResponse = queryGemini(prompt)

            _history.value = _history.value.filter { it != loadingLine }
            _history.value = _history.value + TerminalLine("🤖 GEMINI AI SHELL RESPONDING:", LineType.SYSTEM)
            _history.value = _history.value + TerminalLine(aiResponse, LineType.GEMINI)
        }
    }

    private suspend fun queryGemini(prompt: String): String = withContext(Dispatchers.IO) {
        val apiKey = try {
            com.example.BuildConfig.GEMINI_API_KEY
        } catch (e: Exception) {
            ""
        }

        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            return@withContext "Error: Gemini API Key is missing. Please enter your GEMINI_API_KEY in the Secrets panel in AI Studio to use the terminal AI features."
        }

        val client = OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()

        val jsonMediaType = "application/json; charset=utf-8".toMediaType()
        val escapedPrompt = prompt
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")

        val requestBody = """
        {
          "contents": [
            {
              "parts": [
                {
                  "text": "$escapedPrompt"
                }
              ]
            }
          ],
          "systemInstruction": {
            "parts": [
              {
                "text": "You are a retro Unix terminal AI assistant integrated into a vintage shell. Your responses must be extremely concise, plain-text oriented (do not use markdown formatting like ** or *), and formatted with line breaks to fit inside an 80-character width screen. Speak in a helpful but slightly retro-futuristic hacker-style voice."
              }
            ]
          }
        }
        """.trimIndent()

        val request = Request.Builder()
            .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=$apiKey")
            .post(requestBody.toRequestBody(jsonMediaType))
            .build()

        try {
            client.newCall(request).execute().use { response ->
                val responseBodyString = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext "Error: Shell API failed with status ${response.code}\n$responseBodyString"
                }
                val jsonResponse = org.json.JSONObject(responseBodyString)
                val candidates = jsonResponse.optJSONArray("candidates")
                if (candidates != null && candidates.length() > 0) {
                    val contentNode = candidates.getJSONObject(0).optJSONObject("content")
                    val partsNode = contentNode?.optJSONArray("parts")
                    if (partsNode != null && partsNode.length() > 0) {
                        return@withContext partsNode.getJSONObject(0).optString("text", "No response content.")
                    }
                }
                "Error: Failed to parse terminal AI response."
            }
        } catch (e: Exception) {
            "Connection Error: ${e.localizedMessage ?: "Check your internet connection."}"
        }
    }

    private fun getASCIIHeader(): String {
        return """
 _   _  _____  ____  _   _ 
| \ | |/ _ \ \/ /  || | | |
|  \| | | | \  /|  || |_| |
| |\  | |_| /  \|  ||  _  |
|_| \_|\___/_/\_|_||_| |_|
        """.trimIndent()
    }
}
