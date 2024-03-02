'use client';

export default function Scripts() {
    function toggleDark(isDarkMode: boolean) {
        document.documentElement.classList.toggle('dark', isDarkMode)

    }

    const Frame = <></>

    if (typeof window === 'undefined') return Frame

    window.onload = () => {
        const useDark = window.matchMedia('(prefers-color-scheme: dark)')
        toggleDark(useDark.matches)
        useDark.addListener(function (evt) {
            const isDarkMode = evt.matches
            toggleDark(isDarkMode)
        })
    }
    return Frame
}
