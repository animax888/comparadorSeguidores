const fs = require('fs');

// Función auxiliar para extraer usuarios del HTML usando Regex
function extractUsernamesFromHTML(filePath) {
    try {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const users = new Set();
        
        // Esta expresión regular busca: href="https://www.instagram.com/[_u/ opcional]USUARIO"
        // Captura el grupo ([a-zA-Z0-9._]+) que corresponde al nombre de usuario
        const regex = /href="https:\/\/www\.instagram\.com\/(?:_u\/)?([a-zA-Z0-9._]+)"/g;
        
        let match;
        while ((match = regex.exec(htmlContent)) !== null) {
            users.add(match[1]);
        }
        
        console.log(`> Leído ${filePath}: ${users.size} usuarios encontrados.`);
        return users;
    } catch (error) {
        throw new Error(`No se pudo leer el archivo ${filePath}: ${error.message}`);
    }
}

async function compareFollowers() {
    try {
        console.log('Iniciando análisis...\n');

        // 1. Extraer listas de los archivos HTML
        // Asegúrate de que los nombres de archivo coincidan con los que subiste
        const followingSet = extractUsernamesFromHTML('following.html');
        const followersSet = extractUsernamesFromHTML('followers_1.html');

        // 2. Encontrar usuarios que no te siguen de vuelta
        const notFollowingBack = [];
        for (const user of followingSet) {
            if (!followersSet.has(user)) {
                notFollowingBack.push(user);
            }
        }

        // 3. Ordenar alfabéticamente
        notFollowingBack.sort();

        // 4. Mostrar resultados
        console.log('\n' + '═'.repeat(60));
        console.log('PERSONAS QUE SIGUES PERO NO TE SIGUEN DE VUELTA');
        console.log('═'.repeat(60));
        console.log(`Total: ${notFollowingBack.length} usuarios\n`);

        notFollowingBack.forEach((user, index) => {
            console.log(`${(index + 1).toString().padStart(3)}. ${user}`);
        });

        // 5. Guardar en un archivo
        const outputContent = notFollowingBack.join('\n');
        fs.writeFileSync('no_te_siguen.txt', outputContent, 'utf8');
        
        console.log('\n════════════════════════════════════════════════');
        console.log(`Resultados guardados en: no_te_siguen.txt`);
        console.log(`Total: ${notFollowingBack.length} usuarios`);

    } catch (error) {
        console.error('\nError:', error.message);
        console.log('\nAsegúrate de que los archivos HTML estén en la misma carpeta y se llamen:');
        console.log('- following.html');
        console.log('- followers_1.html');
    }
}

// Ejecutar la función
compareFollowers();
process.stdin.resume(); // Mantiene la consola abierta hasta que la cierres manualmente