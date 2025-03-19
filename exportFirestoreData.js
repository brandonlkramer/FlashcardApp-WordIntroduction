import admin from 'firebase-admin';
import fs from 'fs';
import { writeToStream } from 'fast-csv'; // Correct function for writing CSVs

// Path to your service account JSON file
const serviceAccountPath = './vocab-review-app-1a54293d546d.json';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))
  ),
});

const db = admin.firestore();

async function exportData() {
  const data = [];
  const collectionRef = db.collection('intro_data');

  try {
    const folderPath = './FirestoreData';

    // Ensure the FirestoreData folder exists
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Get current date and time in JST with correct formatting
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const formattedTime = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // "HH-MM-SS"

    const timestamp = `${formattedDate}_${formattedTime}`;
    const filePath = `${folderPath}/exported_data_${timestamp}.csv`;

    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
      console.log('No documents found.');
      return;
    }

    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Deduplicate data using a Set
    const seen = new Set();
    const uniqueData = data.filter((item) => {
      const key = `${item.participant}-${item.word}-${item.iteration}-${item.shownAtDate}-${item.shownAtTime}`;
      if (seen.has(key)) {
        return false; // Duplicate, skip
      }
      seen.add(key);
      return true; // Unique, keep
    });

    // Write deduplicated data to a CSV file
    const ws = fs.createWriteStream(filePath);
    writeToStream(ws, uniqueData, { headers: true })
      .on('finish', () => console.log(`Data has been exported to ${filePath}`))
      .on('error', (error) => console.error('Error writing to CSV:', error));
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportData();
