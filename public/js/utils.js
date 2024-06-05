function getURLParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Opción alternativa: obtener parámetro desde la ruta
function getPathParam() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}