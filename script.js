let globalNotFollowing = [];
const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');

// Escuchar cuando se seleccionan archivos
fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length < 2) {
        alert("Por favor, selecciona al menos dos archivos (following y followers).");
        return;
    }

    let followingHtml = "";
    let followersHtml = "";

    for (const file of files) {
        const content = await readFile(file);
        
        // Lógica de detección automática
        if (file.name.includes('following') || content.includes('_u/')) {
            followingHtml = content;
        } else if (file.name.includes('followers')) {
            followersHtml = content;
        }
    }

    if (followingHtml && followersHtml) {
        status.innerHTML = "<span style='color: green;'>✅ Archivos procesados con éxito</span>";
        processData(followingHtml, followersHtml);
    } else {
        status.innerHTML = "<span style='color: red;'>❌ Error: No se detectaron ambos archivos correctamente.</span>";
    }
});

// Promesa para leer archivos
function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
    });
}

// Extraer usuarios mediante Regex
function extractUsers(html) {
    const users = new Set();
    const regex = /href="https:\/\/www\.instagram\.com\/(?:_u\/)?([a-zA-Z0-9._]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        users.add(match[1]);
    }
    return users;
}

// Comparar listas y mostrar resultados
function processData(htmlFollowing, htmlFollowers) {
    const followingSet = extractUsers(htmlFollowing);
    const followersSet = extractUsers(htmlFollowers);

    globalNotFollowing = [...followingSet]
        .filter(user => !followersSet.has(user))
        .sort((a, b) => a.localeCompare(b));

    document.getElementById('results').style.display = 'block';
    document.getElementById('summary').innerText = globalNotFollowing.length;
    document.getElementById('userList').innerText = globalNotFollowing.join('\n');
    document.getElementById('downloadBtn').style.display = 'block';
}

// Generar y descargar el archivo TXT
function downloadTxt() {
    const date = new Date().toLocaleDateString();
    const content = `REPORTE DE UNFOLLOWERS - ${date}\n` +
                    `Total: ${globalNotFollowing.length}\n` +
                    `${'-'.repeat(30)}\n` +
                    globalNotFollowing.join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unfollowers_${date.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}