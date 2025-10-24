Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🧠 Iniciando AUTO-BUILDER NASA - MODO INFINITO" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

$Root = "C:\ProjetosEV\EVStopPlanner"
$Logs = "$Root\logs"
$Backup = "$Root\autobackups"
New-Item -ItemType Directory -Force -Path $Logs | Out-Null
New-Item -ItemType Directory -Force -Path $Backup | Out-Null

function Write-Log($msg, $level="INFO") {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts][$level] $msg"
    Write-Host $line
    Add-Content -Path "$Logs\AutoBuilder.log" -Value $line
}

function Backup-State {
    $stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $dest = "$Backup\EVStopPlanner_$stamp"
    Write-Log "📦 Criando backup completo..."
    Copy-Item $Root $dest -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "✅ Backup salvo em $dest"
}

function Reinstall-All {
    Write-Log "🧹 Limpando dependências..."
    Remove-Item "$Root\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$Root\package-lock.json" -Force -ErrorAction SilentlyContinue
    npm cache clean --force | Out-Null
    Write-Log "📦 Instalando dependências..."
    cd $Root
    npm install --force | Out-Null
}

function Fix-Icons {
    Write-Log "🎨 Corrigindo pacote de ícones..."
    npm install react-native-vector-icons@latest --force | Out-Null
    $map = "$Root\src\screens\MapScreen.tsx"
    if (Test-Path $map) {
        (Get-Content $map) -replace "from\s+['""]@react-native-vector-icons/ionicons['""]", "from 'react-native-vector-icons/Ionicons'" | Set-Content $map -Encoding UTF8
        Write-Log "✅ Corrigido import em MapScreen.tsx"
    }
}

function Fix-Gradle {
    Write-Log "⚙️ Corrigindo Gradle..."
    Remove-Item "$Root\android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$Root\android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
    cd "$Root\android"
    if (Test-Path ".\gradlew") {
        ./gradlew clean | Out-Null
        Write-Log "✅ Gradle limpo com sucesso."
    } else {
        Write-Log "⚠️ gradlew não encontrado!"
    }
    cd $Root
}

function Fix-React {
    Write-Log "🔩 Sincronizando React Native..."
    npm install react-native@latest --force | Out-Null
    npm install @react-native-community/cli --force | Out-Null
    Write-Log "✅ React Native sincronizado."
}

function Try-Build {
    Write-Log "🚀 Tentando compilar o app..."
    $result = npx react-native run-android 2>&1
    if ($result -match "BUILD SUCCESSFUL") {
        Write-Log "🎯 BUILD SUCCESSFUL!" "SUCCESS"
        return $true
    }
    elseif ($result -match "react-native-vector-icons") {
        Write-Log "⚠️ Erro em react-native-vector-icons detectado."
        Fix-Icons
    }
    elseif ($result -match "Fonts.gradle") {
        Write-Log "⚠️ Fonts.gradle ausente. Corrigindo..."
        Fix-Gradle
    }
    elseif ($result -match "com.facebook.react.settings") {
        Write-Log "⚠️ Erro de configuração React."
        Fix-React
    }
    else {
        Write-Log "⚠️ Erro desconhecido. Aplicando reparo completo..."
        Reinstall-All
        Fix-Gradle
    }
    return $false
}

Write-Log "======== INÍCIO DO CICLO INFINITO ========"
$counter = 1
while ($true) {
    Write-Log "🔁 Tentativa $counter iniciada..."
    Backup-State
    Reinstall-All
    Fix-Icons
    Fix-Gradle
    $ok = Try-Build
    if ($ok) {
        Write-Host "`n✅ APP COMPILADO COM SUCESSO NO CICLO $counter ✅" -ForegroundColor Green
        break
    } else {
        Write-Host "`n💥 Falha detectada. Tentando novamente em 10s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $counter++
    }
}
Write-Host "`n🧩 Finalizado. Verifique se o app abriu corretamente!" -ForegroundColor Cyan
Write-Host "📄 Log completo: $Logs\AutoBuilder.log"
