/**
 * Script de ejemplo para realizar operaciones de Google Drive en backend
 *
 * Este script demuestra cómo usar las funciones de Drive para hacer operaciones
 * programáticas con los tokens almacenados en la base de datos.
 *
 * Uso:
 * 1. Asegúrate de que al menos un usuario esté autenticado
 * 2. Ejecuta: node --loader tsx src/scripts/example-drive-operations.ts
 */

import { dbOperations } from '../lib/db';
import {
  listFiles,
  searchFiles,
  getRecentFiles,
  getStorageInfo,
  getFile,
} from '../lib/drive';

async function main() {
  console.log('🚀 Iniciando operaciones de Drive...\n');

  // Obtener todos los usuarios de la base de datos
  const users = await dbOperations.getAllUsers();

  if (users.length === 0) {
    console.log('❌ No hay usuarios autenticados en la base de datos.');
    console.log('Por favor, autentica al menos un usuario visitando /api/auth/login');
    return;
  }

  console.log(`✅ Encontrados ${users.length} usuario(s) autenticado(s)\n`);

  // Realizar operaciones para cada usuario
  for (const user of users) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧 Usuario: ${user.email}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // 1. Obtener información de almacenamiento
      console.log('📊 Información de almacenamiento:');
      const storage = await getStorageInfo(user.id);
      if (storage.storageQuota) {
        const used = parseInt(storage.storageQuota.usage || '0');
        const limit = parseInt(storage.storageQuota.limit || '0');
        const usedGB = (used / 1024 / 1024 / 1024).toFixed(2);
        const limitGB = (limit / 1024 / 1024 / 1024).toFixed(2);
        const percentage = limit > 0 ? ((used / limit) * 100).toFixed(1) : '0';

        console.log(`   Usado: ${usedGB} GB de ${limitGB} GB (${percentage}%)`);
      }
      console.log();

      // 2. Listar archivos recientes
      console.log('📁 Últimos 5 archivos modificados:');
      const recentFiles = await getRecentFiles(user.id, 5);
      if (recentFiles.files && recentFiles.files.length > 0) {
        recentFiles.files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name}`);
          console.log(`      ID: ${file.id}`);
          console.log(`      Tipo: ${file.mimeType}`);
          console.log(`      Modificado: ${file.modifiedTime}`);
          if (file.webViewLink) {
            console.log(`      Link: ${file.webViewLink}`);
          }
          console.log();
        });
      } else {
        console.log('   No se encontraron archivos');
      }

      // 3. Buscar documentos de Google Docs
      console.log('📄 Buscando Google Docs...');
      const docs = await listFiles(user.id, {
        query: "mimeType='application/vnd.google-apps.document' and trashed=false",
        pageSize: 5,
      });
      if (docs.files && docs.files.length > 0) {
        console.log(`   Encontrados ${docs.files.length} documento(s):`);
        docs.files.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.name}`);
        });
      } else {
        console.log('   No se encontraron Google Docs');
      }
      console.log();

      // 4. Buscar hojas de cálculo
      console.log('📊 Buscando Google Sheets...');
      const sheets = await listFiles(user.id, {
        query: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        pageSize: 5,
      });
      if (sheets.files && sheets.files.length > 0) {
        console.log(`   Encontradas ${sheets.files.length} hoja(s):`);
        sheets.files.forEach((sheet, index) => {
          console.log(`   ${index + 1}. ${sheet.name}`);
        });
      } else {
        console.log('   No se encontraron Google Sheets');
      }
      console.log();

      // 5. Buscar por nombre (ejemplo)
      console.log('🔍 Buscando archivos que contengan "test" en el nombre...');
      const searchResults = await searchFiles(user.id, 'test');
      if (searchResults.files && searchResults.files.length > 0) {
        console.log(`   Encontrados ${searchResults.files.length} archivo(s):`);
        searchResults.files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name}`);
        });
      } else {
        console.log('   No se encontraron archivos');
      }
      console.log();

      // 6. Ejemplo de obtener información detallada de un archivo
      if (recentFiles.files && recentFiles.files.length > 0) {
        const firstFile = recentFiles.files[0];
        console.log(`📋 Información detallada del primer archivo (${firstFile.name}):`);
        const fileDetails = await getFile(user.id, firstFile.id!);
        console.log(`   Nombre: ${fileDetails.name}`);
        console.log(`   ID: ${fileDetails.id}`);
        console.log(`   Tipo MIME: ${fileDetails.mimeType}`);
        console.log(`   Tamaño: ${fileDetails.size ? `${(parseInt(fileDetails.size) / 1024).toFixed(2)} KB` : 'N/A'}`);
        console.log(`   Modificado: ${fileDetails.modifiedTime}`);
        if (fileDetails.description) {
          console.log(`   Descripción: ${fileDetails.description}`);
        }
        console.log();
      }

    } catch (error) {
      console.error(`❌ Error al procesar usuario ${user.email}:`, error);
      if (error instanceof Error) {
        console.error(`   Mensaje: ${error.message}`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Operaciones completadas');
  console.log(`${'='.repeat(60)}\n`);
}

// Ejecutar el script
main().catch(console.error);
