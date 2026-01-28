$relativePath = ".\INVENTARIO OFICIAL BODEGA MANTENCION CERMAQ.xlsx"
$path = Convert-Path $relativePath

Write-Host "Resolved Path: $path"

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $workbook = $excel.Workbooks.Open($path)
    $sheet = $workbook.Sheets.Item(1)
    
    Write-Host "Opened successfully."
    $usedRange = $sheet.UsedRange
    $colCount = $usedRange.Columns.Count
    
    # Read headers (first row)
    $headers = @()
    for ($c = 1; $c -le $colCount; $c++) {
        $cellVal = $sheet.Cells.Item(1, $c).Text
        $headers += $cellVal
    }
    Write-Host "HEADERS_START"
    Write-Host ($headers -join ', ')
    Write-Host "HEADERS_END"

    # Read first 3 data rows
    Write-Host "DATA_START"
    for ($r = 2; $r -le 4; $r++) {
        $rowVals = @()
        for ($c = 1; $c -le $colCount; $c++) {
            $rowVals += $sheet.Cells.Item($r, $c).Text
        }
        Write-Host "ROW|$r|$($rowVals -join '|')"
    }
    Write-Host "DATA_END"

}
catch {
    Write-Host "Error: $_"
}
finally {
    if ($workbook) { $workbook.Close($false) }
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    Remove-Variable excel
}
