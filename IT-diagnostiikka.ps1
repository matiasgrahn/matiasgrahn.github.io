# 1. YMPÄRISTÖMUUTTUJIEN LATAUS .ENV-TIEDOSTOSTA
$EnvPath = Join-Path $PSScriptRoot "backend/.env"
if (Test-Path $EnvPath) {
    Get-Content $EnvPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $name, $value = $line.Split('=', 2)
            if ($name -and $value) {
                [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
            }
        }
    }
}

# --- TIETOKANTAVALINTA ---
# Käynnistettäessä kysytään vain kohde, muuten skripti on hiljainen
Write-Host "`n--- Select Database Destination ---" -ForegroundColor Cyan
Write-Host "1. Local Database (Trusted Connection)"
Write-Host "2. Azure VM Database (SQL Authentication via VPN)"
$choice = Read-Host "Select (1/2)"

if ($choice -eq "1") {
    $dbServer = [System.Environment]::GetEnvironmentVariable("DB_SERVER_LOCAL")
    $dbName = [System.Environment]::GetEnvironmentVariable("DB_NAME_LOCAL")
    $connectionString = "Server=$dbServer;Database=$dbName;Integrated Security=True;TrustServerCertificate=True;"
} else {
    $dbServer = [System.Environment]::GetEnvironmentVariable("DB_SERVER_VM")
    $dbName = [System.Environment]::GetEnvironmentVariable("DB_NAME_VM")
    $dbUser = [System.Environment]::GetEnvironmentVariable("DB_USER_VM")
    $dbPass = [System.Environment]::GetEnvironmentVariable("DB_PASS_VM")
    
    # Azure-yhteys VPN:n yli (10.0.0.4)
    $connectionString = "Server=$dbServer;Database=$dbName;User ID=$dbUser;Password=$dbPass;Encrypt=False;"
}

# 2. TIETOJEN KERÄÄMINEN (HILJAINEN TAUSTA-AJO)
$Laitetunnus = $env:COMPUTERNAME
$OS = (Get-CimInstance Win32_OperatingSystem).Caption
$Arkkitehtuuri = $env:PROCESSOR_ARCHITECTURE
$BootTime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$Uptime = (Get-Date) - $BootTime

# BIOS/UUID haku
$TempSerial = (Get-CimInstance Win32_Bios).SerialNumber
if ($null -eq $TempSerial -or $TempSerial -match "Default String" -or $TempSerial -match "System Serial Number") {
    $FinalID = (Get-CimInstance Win32_ComputerSystemProduct).UUID
    $IDType = "UUID"
} else {
    $FinalID = $TempSerial
    $IDType = "BIOS"
}

# Ohjelmistojen haku
$InstalledApps = Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | 
    Where-Object { $_.DisplayName -ne $null } | 
    Select-Object DisplayName, DisplayVersion | 
    Sort-Object DisplayName
$AppsJson = $InstalledApps | ConvertTo-Json -Compress

# Ohjelmistojen terveys
$RequiredApps = @("Visual Studio Code", "Node.js", "Git", "Microsoft SQL Server")
$SoftwareStatus = "OK"
foreach ($Required in $RequiredApps) {
    if (-not ($InstalledApps | Where-Object { $_.DisplayName -like "*$Required*" })) {
        $SoftwareStatus = "Missing Components"
        break
    }
}

# Verkkotesti
$NetStatus = "Disconnected"
if (Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet) {
    $NetStatus = "Connected"
}
$IP = (Get-NetIPAddress -InterfaceAlias "Ethernet*" -AddressFamily IPv4 | Select-Object -First 1).IPAddress

# Levytila
$Drive = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
$VapaaGB = [Math]::Round($Drive.FreeSpace / 1GB, 1)

# Windows-päivitykset
try {
    $UpdateSession = New-Object -ComObject Microsoft.Update.Session
    $UpdateSearcher = $UpdateSession.CreateUpdateSearcher()
    $Count = ($UpdateSearcher.Search("IsInstalled=0 and Type='Software' and IsHidden=0")).Updates.Count
} catch {
    $Count = 0
}

# --- TRENDIN LASKENTA ---
$TrendiIcon = "Ennallaan" # Asetetaan oletusarvo heti alussa
try {
    $conn = New-Object System.Data.SqlClient.SqlConnection
    $conn.ConnectionString = $connectionString
    $conn.Open()
    
    # Haetaan vain viimeisin lukema
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT TOP 1 Levytila FROM SystemDiagnostics ORDER BY LogTime DESC"
    $lastValueRaw = $cmd.ExecuteScalar()
    $conn.Close()

    if ($null -ne $lastValueRaw) {
        # Puhdistetaan " GB" pois ja varmistetaan että on numero (double)
        $VanhaLevy = [double]($lastValueRaw -replace "[^0-9.]", "")
        $NykyinenLevy = [double]$VapaaGB

        if ($NykyinenLevy -lt $VanhaLevy) { 
            $TrendiIcon = "Laskussa" 
        } elseif ($NykyinenLevy -gt $VanhaLevy) { 
            $TrendiIcon = "Kasvussa" 
        }
    }
} catch {
    # Jos tulee virhe (esim. eka kerta kun taulu on tyhjä), pidetään oletusarvo
    $TrendiIcon = "Ennallaan"
}

# 3. TALLENNUS TIETOKANTAAN (SQL-YHTEYS)
try {

    $SqlQuery = "INSERT INTO SystemDiagnostics (ComputerName, Suoritin, UptimeDays, OSVersion, NetworkStatus, IP, Levytila, Paivitykset, Trendi, Sarjanumero, Tunnistetyyppi, OhjelmatJSON, SoftwareHealth) 
                 VALUES ('$Laitetunnus', '$Arkkitehtuuri', $($Uptime.Days), '$OS', '$NetStatus', '$IP', '$VapaaGB', '$Count kpl', '$TrendiIcon', '$FinalID', '$IDType', '$AppsJson', '$SoftwareStatus')"

    $conn = New-Object System.Data.SqlClient.SqlConnection
    $conn.ConnectionString = $connectionString
    $conn.Open()
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $SqlQuery
    $cmd.ExecuteNonQuery()
    
    $conn.Close()
    Write-Host "`n[SUCCESS] Data saved to database." -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] SQL Failure: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. JSON-TIEDOSTON PÄIVITYS (DOCKER/LOCAL DASHBOARD)
$StatusData = [PSCustomObject]@{
    Pvm         = Get-Date -Format "dd.MM.yyyy HH:mm"
    Kone        = $Laitetunnus
    Status      = "Online"
    Levy        = "$VapaaGB GB"
    Trendi      = $TrendiIcon
    Paivitykset = if ($Count -gt 0) { "$Count kpl" } else { "Ajan tasalla" }
}
$StatusData | ConvertTo-Json | Out-File -FilePath (Join-Path $PSScriptRoot "status.json") -Encoding utf8 -Force