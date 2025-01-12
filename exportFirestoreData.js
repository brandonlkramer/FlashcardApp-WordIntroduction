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
  const collectionRef = db.collection('study_data');

  try {
    const folderPath = './FirestoreData';
    // Get current date and time in JST
    const now = new Date();
    const options = { timeZone: 'Asia/Tokyo', hour12: false };
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      ...options,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-CA', {
      ...options,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const formattedDate = dateFormatter.format(now); // e.g., "2025-01-11"
    const formattedTime = timeFormatter.format(now).replace(/:/g, '-'); // e.g., "14-30-45"
    const timestamp = `${formattedDate}_${formattedTime}`;
    const filePath = `${folderPath}/exported_data_${timestamp}.csv`;

    // Ensure the FirestoreData folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const snapshot = await collectionRef.get();
    if (snapshot.empty) {
      console.log('No documents found.');
      return;
    }

    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Deduplicate data based on unique fields
    const uniqueData = data.filter((item, index, self) =>
      index === self.findIndex(other =>
        other.participant === item.participant &&
        other.word === item.word &&
        other.iteration === item.iteration &&
        other.shownAtDate === item.shownAtDate &&
        other.shownAtTime === item.shownAtTime
      )
    );

    // Write deduplicated data to a CSV file with JST date and time in the filename
    const ws = fs.createWriteStream(filePath);
    writeToStream(ws, uniqueData, { headers: true })
      .on('finish', () => console.log(`Data has been exported to ${filePath}`))
      .on('error', (error) => console.error('Error writing to CSV:', error));
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportData();
