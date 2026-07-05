package com.example.terminal

sealed class VNode {
    abstract val name: String
    abstract val parentPath: String
    abstract val absolutePath: String
}

data class VDirectory(
    override val name: String,
    override val parentPath: String
) : VNode() {
    override val absolutePath: String
        get() = if (parentPath == "/") "/$name" else if (parentPath.endsWith("/")) "$parentPath$name" else "$parentPath/$name"
}

data class VFile(
    override val name: String,
    override val parentPath: String,
    var content: String = ""
) : VNode() {
    override val absolutePath: String
        get() = if (parentPath == "/") "/$name" else if (parentPath.endsWith("/")) "$parentPath$name" else "$parentPath/$name"
}

class VirtualFileSystem {
    var currentDirPath: String = "/home/user"
        private set

    private val nodes = mutableMapOf<String, VNode>()

    init {
        // Initialize basic structure
        nodes["/"] = VDirectory("", "/")
        
        createDirForce("/home")
        createDirForce("/home/user")
        createDirForce("/home/user/documents")
        createDirForce("/system")
        createDirForce("/etc")
        
        createFileForce("/home/user/about.txt", "Retro Terminal OS v1.0.4\nDeveloped in AI Studio using Jetpack Compose.\nType 'help' to see a list of available system commands.")
        createFileForce("/home/user/todo.txt", "[-] Try neofetch to view specs\n[-] Run matrix command for screensaver\n[-] Try 'gemini [your question]' to use AI shell\n[-] Change colors with 'theme green|amber|cyan|slate'")
        createFileForce("/home/user/documents/notes.txt", "Virtual File System logs: All operations touch, mkdir, echo and rm are persistent in state.\nUse the Tab key to auto-complete directory names!")
        createFileForce("/system/build.prop", "ro.product.model=RetroTerminalX\nro.build.version.release=11.0.0\nro.build.tags=release-keys\nro.terminal.author=DeepMind-AIS\nro.display.refresh=60Hz")
        createFileForce("/etc/hosts", "127.0.0.1 localhost\n::1 localhost\n10.0.2.2 android-host")
    }

    private fun createDirForce(path: String) {
        val lastSlash = path.lastIndexOf('/')
        val parent = if (lastSlash == 0) "/" else path.substring(0, lastSlash)
        val name = path.substring(lastSlash + 1)
        nodes[path] = VDirectory(name, parent)
    }

    private fun createFileForce(path: String, content: String) {
        val lastSlash = path.lastIndexOf('/')
        val parent = if (lastSlash == 0) "/" else path.substring(0, lastSlash)
        val name = path.substring(lastSlash + 1)
        nodes[path] = VFile(name, parent, content)
    }

    fun getPromptPath(): String {
        return if (currentDirPath == "/home/user") "~" else currentDirPath
    }

    fun resolvePath(path: String): String {
        val expanded = when {
            path == "~" -> "/home/user"
            path.startsWith("~/") -> "/home/user" + path.substring(1)
            path.startsWith("/") -> path
            else -> if (currentDirPath == "/") "/$path" else "$currentDirPath/$path"
        }
        
        val parts = expanded.split("/").filter { it.isNotEmpty() }
        val resolvedParts = mutableListOf<String>()
        for (part in parts) {
            if (part == "..") {
                if (resolvedParts.isNotEmpty()) {
                    resolvedParts.removeAt(resolvedParts.size - 1)
                }
            } else if (part != ".") {
                resolvedParts.add(part)
            }
        }
        return "/" + resolvedParts.joinToString("/")
    }

    fun getNode(path: String): VNode? {
        val resolved = resolvePath(path)
        if (resolved == "/") return nodes["/"]
        return nodes[resolved]
    }

    fun listDir(path: String = currentDirPath): List<VNode>? {
        val resolved = resolvePath(path)
        val node = getNode(resolved)
        if (node !is VDirectory) return null
        
        return nodes.values.filter { it.parentPath == resolved && it.absolutePath != "/" }
            .sortedBy { it.name }
    }

    fun changeDir(path: String): Boolean {
        val resolved = resolvePath(path)
        val node = getNode(resolved)
        if (node is VDirectory) {
            currentDirPath = resolved
            return true
        }
        return false
    }

    fun mkdir(name: String): Boolean {
        if (name.contains("/") || name.isEmpty()) return false
        val newPath = if (currentDirPath == "/") "/$name" else "$currentDirPath/$name"
        if (nodes.containsKey(newPath)) return false
        
        nodes[newPath] = VDirectory(name, currentDirPath)
        return true
    }

    fun touch(name: String, content: String = ""): Boolean {
        if (name.contains("/") || name.isEmpty()) return false
        val newPath = if (currentDirPath == "/") "/$name" else "$currentDirPath/$name"
        val existing = nodes[newPath]
        if (existing is VFile) {
            existing.content = content
            return true
        } else if (existing is VDirectory) {
            return false
        }
        
        nodes[newPath] = VFile(name, currentDirPath, content)
        return true
    }

    fun rm(name: String): Boolean {
        val targetPath = resolvePath(name)
        if (targetPath == "/" || targetPath == "/home" || targetPath == "/home/user") return false // protected
        val node = nodes[targetPath] ?: return false
        
        if (node is VDirectory) {
            val toDelete = nodes.keys.filter { it.startsWith("$targetPath/") || it == targetPath }
            for (key in toDelete) {
                nodes.remove(key)
            }
        } else {
            nodes.remove(targetPath)
        }
        return true
    }
}
