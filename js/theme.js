'use strict'

function applyTheme() {
    var theme = getRadioValue(document.querySelectorAll('input[name="theme"]'), true)
    var elStyleSheet = document.getElementById("sTheme")
    console.log(`selected theme: ${theme}`)
    console.log(theme.gameWinBg)
    if (theme === "classic") {
        elStyleSheet.href = 'css/style.css'
    } else if (theme === "olivia") {
        elStyleSheet.href = 'css/olivia.css'
    } else if (theme === "botanical") {
        elStyleSheet.href = 'css/botanical.css'
    } else if (theme === "water") {
        elStyleSheet.href = 'css/water.css'
    } else if (theme === "dark") {
        elStyleSheet.href = 'css/dark.css'
    }
    renderSmiley(document.querySelector(".smiley"))
}

