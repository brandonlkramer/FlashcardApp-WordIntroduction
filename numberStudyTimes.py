import os
import pandas as pd

folder_path = "FirestoreData"

# Get the latest exported CSV file
csv_files = [f for f in os.listdir(folder_path) if f.endswith(".csv")]
csv_files.sort(reverse=True)  # Sort by newest first
latest_file = os.path.join(folder_path, csv_files[0]) if csv_files else None

if latest_file:
    # Load the CSV file
    df = pd.read_csv(latest_file)
    df.columns = df.columns.str.strip()  # Remove spaces from column names

    # Check if the required columns exist
    required_columns = {"participant", "shownAtDate"}
    if not required_columns.issubset(set(df.columns)):
        print("Error: 'participant' or 'shownAtDate' column missing in CSV file.")
        print("Found columns:", df.columns)
        exit()

    # Convert shownAtDate to datetime format
    df["shownAtDate"] = pd.to_datetime(df["shownAtDate"], errors="coerce")

    # Count unique study days per participant
    study_days_count = df.groupby("participant")["shownAtDate"].nunique().reset_index()
    study_days_count.rename(columns={"shownAtDate": "uniqueStudyDays"}, inplace=True)

    # Output the results
    print("Unique Study Days per Participant:")
    print(study_days_count)

    # Save to a new CSV file
    output_file = os.path.join(folder_path, "study_days_per_participant.csv")
    study_days_count.to_csv(output_file, index=False)
    print(f"Study days count saved to {output_file}")

else:
    print("Error: No CSV file found in the FirestoreData folder.")
