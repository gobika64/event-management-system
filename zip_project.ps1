# PowerShell Script to compress the Event Management System project
# This script bundles only the source code and configuration files, excluding large node_modules directories.

$sourceItems = @(
    "backend",
    "frontend",
    "package.json",
    "README.md",
    "zip_project.ps1"
)

$destinationZip = "event-manager.zip"

Write-Host "Starting Event Manager project compression..." -ForegroundColor Cyan

# Remove existing zip if it exists
if (Test-Path $destinationZip) {
    Remove-Item $destinationZip -Force
    Write-Host "Removed existing event-manager.zip" -ForegroundColor Yellow
}

# Run standard Windows compression command
Compress-Archive -Path $sourceItems -DestinationPath $destinationZip -Force

if (Test-Path $destinationZip) {
    Write-Host "Success! Event Management System has been packed into: event-manager.zip" -ForegroundColor Green
    Write-Host "You can find it at: $((Get-Item $destinationZip).FullName)" -ForegroundColor Green
} else {
    Write-Host "Error: Failed to create zip file." -ForegroundColor Red
}
