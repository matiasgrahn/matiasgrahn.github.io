Clear-Host

# 1. TIETOJEN NOUTO
$Laitetunnus = $env:COMPUTERNAME
$OS = (Get-CimInstance Win32_OperatingSystem).Caption
$Arkkitehtuuri = $env:PROCESSOR_ARCHITECTURE
$BootTime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$Uptime = (Get-Date) - $BootTime

# Muotoillaan uptime
$UptimeDisplay = "{0} pv, {1} h, {2} min" -f $Uptime.Days, $Uptime.Hours, $Uptime.Minutes

# 2. TULOSTUS RUUDULLE
Write-Host "==========================================" -ForegroundColor Gray
Write-Host "         IT-TUEN VIANMAARITYS             " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Write-Host " Laitetunnus:       $Laitetunnus"
Write-Host " Prosessori:       $Arkkitehtuuri"
Write-Host " Kayttojarjestelma: $OS"
Write-Host " Kone ollut paalla: $UptimeDisplay" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Gray
# Verkkotesti (Korjattu versio)
Write-Host " Verkkoyhteys (Ping-testi):" -ForegroundColor Cyan
$IP = (Get-NetIPAddress -InterfaceAlias "Ethernet 4" -AddressFamily IPv4 |
Select-Object -ExpandProperty IPAddress)

Write-Host " Sisainen IP:       $IP"
ping.exe 8.8.8.8 -n 1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $NetStatus = "Connected"
    $NetColor = "Green"
} else {
    $NetStatus = "Disconnected"
    $NetColor = "Red"
}
Write-Host " Verkkoyhteys:      $NetStatus" -ForegroundColor $NetColor

# Levytila
$Drive = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
$VapaaGB = [Math]::Round($Drive.FreeSpace / 1GB, 1)
if (-not $VapaaGB) { $VapaaGB = "Virhe datassa" }
Write-Host " Vapaa levytila:    $VapaaGB GB" -NoNewline
if ($VapaaGB -lt 20) { 
    Write-Host " (VAROITUS!)" -ForegroundColor Red 
} else { 
    Write-Host " (OK)" -ForegroundColor Green 
}

Write-Host "==========================================" -ForegroundColor Gray

# WINDOWS-PÄIVITYKSET
Write-Host " Paivitykset:       " -NoNewline
try {
    $UpdateSession = New-Object -ComObject Microsoft.Update.Session
    $UpdateSearcher = $UpdateSession.CreateUpdateSearcher()
    $SearchResult = $UpdateSearcher.Search("IsInstalled=0 and Type='Software' and IsHidden=0")
    
    $Count = $SearchResult.Updates.Count
    if ($Count -gt 0) {
        Write-Host "Saatavilla ($Count kpl)" -ForegroundColor Yellow
    } else {
        Write-Host "Ajan tasalla" -ForegroundColor Green
    }
} catch {
    Write-Host "Ei voida tarkistaa juuri nyt" -ForegroundColor Gray
}
Write-Host "==========================================" -ForegroundColor Gray

# 3. SQL-INTEGRAATIO
Write-Host "`n Tallennetaan tietoja tietokantaan..." -ForegroundColor Magenta

$ServerName = "localhost\SQLEXPRESS"
$DatabaseName = "InventoryDB"

$CheckQuery = "SELECT TOP 1 Levytila FROM SystemDiagnostics ORDER BY ID DESC"
$TrendiIcon = "➡️ Ennallaan" # Oletusarvo

try {
    $LastEntry = Invoke-Sqlcmd -ServerInstance $ServerName -Database $DatabaseName -Query $CheckQuery -ErrorAction SilentlyContinue
    if ($LastEntry) {
        $VanhaLevy = [double]($LastEntry.Levytila -replace " GB", "") # Puhdistetaan yksikkö pois vertailua varten
        
        if ($VapaaGB -lt $VanhaLevy) {
        $TrendiIcon = "Laskussa"
}       elseif ($VapaaGB -gt $VanhaLevy) {
        $TrendiIcon = "Kasvussa"
}       else {
        $TrendiIcon = "Ennallaan"
}
    }
} catch {
    Write-Host " Ei aiempaa dataa vertailuun." -ForegroundColor Gray
}

# Muodostetaan SQL-lause. Huom: $($Uptime.Days) varmistaa että lähtee pelkkä numero.
$SqlQuery = "INSERT INTO SystemDiagnostics (ComputerName, Suoritin, UptimeDays, OSVersion, NetworkStatus, IP, Levytila, Paivitykset, Trendi) 
             VALUES ('$Laitetunnus','$Arkkitehtuuri', $($Uptime.Days), '$OS', '$NetStatus', '$IP', '$VapaaGB', '$Count kpl', '$TrendiIcon')"

try {
    # Suoritetaan komento
    Invoke-Sqlcmd -ServerInstance $ServerName -Database $DatabaseName -Query $SqlQuery -ErrorAction Stop
    Write-Host " SQL-paivitys onnistui!" -ForegroundColor Green
} catch {
    Write-Host " SQL-virhe: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Gray

# 4. JSON-TIEDOSTON LUONTI DOCKERILLE
# Luodaan objekti, jossa on kaikki tärkeät tiedot
$StatusData = [PSCustomObject]@{
    Pvm         = Get-Date -Format "dd.MM.yyyy HH:mm"
    Kone        = $Laitetunnus
    Status      = "Online"
    Levy        = "$VapaaGB GB"
    Trendi      = $TrendiIcon  # TÄMÄ ON UUSI
    Paivitykset = if ($Count -gt 0) { "$Count kpl" } else { "Ajan tasalla" }
}

# Pakotetaan tallennus UTF8-muotoon (sisältäen BOM-merkin, jota selain usein vaatii Windows-ympäristössä)
$JsonPath = Join-Path $PSScriptRoot "status.json"
$StatusData | ConvertTo-Json | Out-File -FilePath $JsonPath -Encoding utf8 -Force

Write-Host " JSON tallennettu onnistuneesti UTF-8 muodossa!" -ForegroundColor Cyan