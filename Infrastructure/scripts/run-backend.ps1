# Loads the root .env into the process environment, then starts the Spring Boot
# backend. Spring Boot (unlike the AI service and Vite) does not read .env on its
# own, so this wrapper bridges that. Run from anywhere:
#     powershell -ExecutionPolicy Bypass -File Infrastructure/scripts/run-backend.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$envFile = Join-Path $root ".env"
if (-not (Test-Path $envFile)) { throw "Missing $envFile - copy .env.example to .env first." }

function Import-EnvFile($path) {
    if (-not (Test-Path $path)) { return }
    Get-Content $path | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $idx = $line.IndexOf("=")
            $name = $line.Substring(0, $idx).Trim()
            $value = $line.Substring($idx + 1).Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}
Import-EnvFile $envFile
# Layer .env.local on top (same order as the AI service / Vite), if present.
Import-EnvFile (Join-Path $root ".env.local")
Write-Host "Loaded env from $envFile; starting backend on port $env:BACKEND_PORT..."
Push-Location (Join-Path $root "Backend")
try { mvn spring-boot:run } finally { Pop-Location }
