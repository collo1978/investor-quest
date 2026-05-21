# Run once in PowerShell *as Administrator* if your phone cannot reach port 3003.
# Right-click PowerShell → Run as administrator, then:
#   Set-Location "C:\Users\collo\.cursor\projects\empty-window\investor-quest"
#   .\scripts\allow-dev-firewall.ps1

$ruleName = "Investor Quest Dev (TCP 3003)"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName"
} else {
  New-NetFirewallRule -DisplayName $ruleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 3003 `
    -Profile Private `
    -Description "Next.js dev server for Mission Control on phone (LAN)"
  Write-Host "Created inbound rule for TCP 3003 (Private networks)."
}

Write-Host ""
Write-Host "Ensure npm run dev is running, then on your phone open:"
Write-Host "  http://YOUR_LAN_IP:3003/admin/game-health"
Write-Host ""
Write-Host "Find YOUR_LAN_IP: ipconfig  →  IPv4 under Wi-Fi"
