# Crea el tablero del Sprint 1 en GitHub (WP-B). Ejecutar UNA sola vez desde C:\dev\tamalecho:
#   powershell -ExecutionPolicy Bypass -File docs\sprint-1\crear-tablero.ps1
# Requiere: gh instalado y autenticado con `gh auth refresh -s project`.
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$owner = "techbeariasolutions-maker"
$repo  = "$owner/tamalecho"
$milestone = "Sprint 1 · 23/10/2026"

Write-Host "1/5 Etiquetas..."
$labels = @(
    @("HU","1D76DB"), @("HT","5319E7"), @("Debe","B60205"), @("Debería","FBCA04"),
    @("sprint-1","0E8A16"), @("defecto","D93F0B")
)
foreach ($l in $labels) { gh label create $l[0] --color $l[1] --repo $repo --force | Out-Null }
1..10 | ForEach-Object { gh label create "WP-$_" --color "C5DEF5" --repo $repo --force | Out-Null }
gh label create "WP-B" --color "C5DEF5" --repo $repo --force | Out-Null

Write-Host "2/5 Milestone..."
$existing = gh api "repos/$repo/milestones?state=all" | ConvertFrom-Json
if (-not ($existing | Where-Object { $_.title -eq $milestone })) {
    gh api "repos/$repo/milestones" -f "title=$milestone" -f "due_on=2026-10-24T05:59:59Z" -f "description=Meta: plataforma pública navegable en móvil y escritorio, con dos bibliotecas y 24 consejos revisados y enlazados a sus fuentes." | Out-Null
}

Write-Host "3/5 Proyecto..."
$proj = gh project create --owner $owner --title "TamalEcho · Sprint 1" --format json | ConvertFrom-Json
$num = $proj.number
if (-not $num) { throw "No se pudo crear el proyecto. ¿Corriste gh auth refresh -s project?" }
gh project link $num --owner $owner --repo tamalecho | Out-Null
gh project field-create $num --owner $owner --name "Estado" --data-type "SINGLE_SELECT" --single-select-options "Pendiente,En curso,En prueba,Terminado" | Out-Null
$fields = gh project field-list $num --owner $owner --format json | ConvertFrom-Json
$estado = $fields.fields | Where-Object { $_.name -eq "Estado" }
$pendiente = $estado.options | Where-Object { $_.name -eq "Pendiente" }

$acts = @(
    @{ Id="HT-01.1-A"; Title="Crear Vite + React + JS, repositorio, ramas y convenciones"; Type="HT"; Prio="Debe"; Wp="WP-1"; Sub="HT-01.1"; Crit="Otro integrante clona y ejecuta la web sin ajustes secretos." }
    @{ Id="HT-01.1-B"; Title="Comandos dev/build/lint/test y README"; Type="HT"; Prio="Debe"; Wp="WP-1"; Sub="HT-01.1"; Crit="Otro integrante clona y ejecuta la web sin ajustes secretos." }
    @{ Id="HT-01.2-A"; Title="Pipeline de build y pruebas + vista previa HTTPS"; Type="HT"; Prio="Debe"; Wp="WP-4"; Sub="HT-01.2"; Crit="El pipeline pasa y una versión de la web se abre desde un enlace externo." }
    @{ Id="HT-01.2-B"; Title="Despliegue versionado y rollback documentado"; Type="HT"; Prio="Debe"; Wp="WP-4"; Sub="HT-01.2"; Crit="El pipeline pasa y una versión de la web se abre desde un enlace externo." }
    @{ Id="HT-02.1-A"; Title="Rutas, Layout y carpetas por feature"; Type="HT"; Prio="Debe"; Wp="WP-2"; Sub="HT-02.1"; Crit="Los módulos navegan y sus piezas se reutilizan sin copias de lógica." }
    @{ Id="HT-02.2-A"; Title="Tokens CSS (tipografía, espacios, colores, foco, breakpoints)"; Type="HT"; Prio="Debería"; Wp="WP-2"; Sub="HT-02.2"; Crit="Un cambio de estilo base se refleja sin editar cada pantalla por separado." }
    @{ Id="HT-02.2-B"; Title="Componentes base (botón, mensajes, errores) con pruebas"; Type="HT"; Prio="Debería"; Wp="WP-2"; Sub="HT-02.2"; Crit="Un cambio de estilo base se refleja sin editar cada pantalla por separado." }
    @{ Id="HU-01.2-A"; Title="Layout, Header y navegación responsiva"; Type="HU"; Prio="Debe"; Wp="WP-2"; Sub="HU-01.2"; Crit="Las secciones se localizan en tres clics o menos en móvil y escritorio." }
    @{ Id="HT-03.1-A"; Title="Contrato del tip"; Type="HT"; Prio="Debe"; Wp="WP-3"; Sub="HT-03.1"; Crit="Un tip inválido provoca un error controlado en la validación antes del despliegue." }
    @{ Id="HT-03.1-B"; Title="Validador del catálogo (ID único, obligatorios, URL, duplicados)"; Type="HT"; Prio="Debe"; Wp="WP-3"; Sub="HT-03.1"; Crit="Un tip inválido provoca un error controlado en la validación antes del despliegue." }
    @{ Id="HT-02.1-B"; Title="Hooks y estado mínimo; sin lógica en componentes visuales"; Type="HT"; Prio="Debe"; Wp="WP-3"; Sub="HT-02.1"; Crit="Los módulos navegan y sus piezas se reutilizan sin copias de lógica." }
    @{ Id="HT-03.2-A"; Title="Importar 24 tips (12 + 12) con referencias"; Type="HT"; Prio="Debe"; Wp="WP-5"; Sub="HT-03.2"; Crit="Se cuentan 24 fichas completas, todas con su fuente y la versión del catálogo." }
    @{ Id="HU-03.1-A"; Title="Tarjeta: título, resumen, área, acción y Ver más"; Type="HU"; Prio="Debe"; Wp="WP-6"; Sub="HU-03.1"; Crit="Cada consejo abre una ficha con concepto, aplicación y referencia consultable." }
    @{ Id="HU-01.1-A"; Title="HomePage con tip destacado y accesos Scrum/PMBOK"; Type="HU"; Prio="Debe"; Wp="WP-6"; Sub="HU-01.1"; Crit="Al abrir el enlace sin cuenta aparece un tip y se puede navegar a ambos enfoques." }
    @{ Id="HU-02.1-A"; Title="Selector Scrum/PMBOK con categorías y filtros"; Type="HU"; Prio="Debe"; Wp="WP-6"; Sub="HU-02.1"; Crit="Al seleccionar cada enfoque se visualizan sus categorías y al menos 12 conceptos revisados." }
    @{ Id="HU-02.1-B"; Title="Cargar los 24 tips con fuente y etiquetas"; Type="HU"; Prio="Debe"; Wp="WP-6"; Sub="HU-02.1"; Crit="Al seleccionar cada enfoque se visualizan sus categorías y al menos 12 conceptos revisados." }
    @{ Id="HU-03.1-B"; Title="Ficha completa con explicación, error, ejemplo y fuente"; Type="HU"; Prio="Debe"; Wp="WP-7"; Sub="HU-03.1"; Crit="Cada consejo abre una ficha con concepto, aplicación y referencia consultable." }
    @{ Id="HU-03.2-A"; Title="Siguiente tip y volver conservando el filtro"; Type="HU"; Prio="Debería"; Wp="WP-7"; Sub="HU-03.2"; Crit="La navegación entre consejos funciona y no se muestran enlaces rotos conocidos." }
    @{ Id="HU-03.2-B"; Title="Validar enlaces externos y estados alternos"; Type="HU"; Prio="Debería"; Wp="WP-7"; Sub="HU-03.2"; Crit="La navegación entre consejos funciona y no se muestran enlaces rotos conocidos." }
    @{ Id="HU-02.2-A"; Title="Sugerencia inicial y cambio de enfoque sin perder la lectura"; Type="HU"; Prio="Debería"; Wp="WP-8"; Sub="HU-02.2"; Crit="El usuario puede cambiar de enfoque y consultar un ejemplo comparativo." }
    @{ Id="HU-02.2-B"; Title="Explicaciones diferenciadas y ejemplo comparativo"; Type="HU"; Prio="Debería"; Wp="WP-8"; Sub="HU-02.2"; Crit="El usuario puede cambiar de enfoque y consultar un ejemplo comparativo." }
    @{ Id="HU-01.1-B"; Title="Estados de carga, enlaces visibles y flujo con teclado"; Type="HU"; Prio="Debería"; Wp="WP-8"; Sub="HU-01.1"; Crit="Al abrir el enlace sin cuenta aparece un tip y se puede navegar a ambos enfoques." }
    @{ Id="HU-11.1-A"; Title="Estilos mobile-first: tipografía, contraste, objetivos táctiles"; Type="HU"; Prio="Debe"; Wp="WP-9"; Sub="HU-11.1"; Crit="El flujo completo es legible y operable en móvil y escritorio." }
    @{ Id="HU-11.1-B"; Title="Revisión a 360 px y escritorio sin desplazamiento horizontal"; Type="HU"; Prio="Debe"; Wp="WP-9"; Sub="HU-11.1"; Crit="El flujo completo es legible y operable en móvil y escritorio." }
    @{ Id="HU-11.2-A"; Title="Etiquetas accesibles, foco visible y teclado"; Type="HU"; Prio="Debe"; Wp="WP-9"; Sub="HU-11.2"; Crit="Puede consultarse un tip y cerrarse un aviso únicamente con teclado." }
    @{ Id="HU-11.2-B"; Title="Movimiento reducido, contraste y lector de pantalla básico"; Type="HU"; Prio="Debe"; Wp="WP-9"; Sub="HU-11.2"; Crit="Puede consultarse un tip y cerrarse un aviso únicamente con teclado." }
    @{ Id="HU-01.2-B"; Title="Probar enlaces, regreso, menú móvil y ruta inexistente"; Type="HU"; Prio="Debería"; Wp="WP-9"; Sub="HU-01.2"; Crit="Las secciones se localizan en tres clics o menos en móvil y escritorio." }
    @{ Id="HT-03.2-B"; Title="Aprobación del contenido y versión 1.0.0 del catálogo"; Type="HT"; Prio="Debe"; Wp="WP-10"; Sub="HT-03.2"; Crit="Se cuentan 24 fichas completas, todas con su fuente y la versión del catálogo." }
)

Write-Host "4/5 Issues (28)..."
$i = 0
foreach ($a in $acts) {
    $i++
    $title = "$($a.Id) · $($a.Title)"
    $body = "**Subhistoria:** $($a.Sub)`n**Prioridad (N4):** $($a.Prio)`n**Paquete de trabajo:** $($a.Wp) (docs/sprint-1/PROMPTS.md)`n`n**Criterio de aceptación (propuesta):** $($a.Crit)`n`n**Definition of Done:** docs/sprint-1/PLAN.md §7"
    $url = gh issue create --repo $repo --title $title --body $body --label "$($a.Type),$($a.Prio),sprint-1,$($a.Wp)" --milestone $milestone
    if ($LASTEXITCODE -ne 0 -or -not $url) { throw "Falló la creación de: $title. Avísale a Claude antes de volver a correr el script." }
    $item = gh project item-add $num --owner $owner --url $url --format json | ConvertFrom-Json
    gh project item-edit --id $item.id --project-id $proj.id --field-id $estado.id --single-select-option-id $pendiente.id | Out-Null
    Write-Host "  [$i/28] $title"
}

Write-Host "5/5 Listo. Abre el proyecto:"
Write-Host "  https://github.com/users/$owner/projects/$num"
Write-Host "En el proyecto: New view > Board > agrupar por 'Estado'. Toma la captura para docs/evidencias/sprint-1/tablero-inicio.png"
