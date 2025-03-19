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

    # Check if the required columns exist (case-sensitive match)
    required_columns = {"participant", "shownAtDate"}  # Ensure correct column names
    if not required_columns.issubset(set(df.columns)):
        print("Error: 'participant' or 'shownAtDate' column missing in CSV file.")
        print("Found columns:", df.columns)
        exit()

    # Convert shownAtDate to datetime format for proper sorting
    df["shownAtDate"] = pd.to_datetime(df["shownAtDate"], errors="coerce")

    # Get the earliest date per participant
    earliest_dates = df.groupby("participant")["shownAtDate"].min().reset_index()

    # Output the results
    print("Earliest ShownAtDate for each Participant:")
    print(earliest_dates)

    # Save to a new CSV file
    output_file = os.path.join(folder_path, "earliest_participants_dates.csv")
    earliest_dates.to_csv(output_file, index=False)
    print(f"Earliest dates saved to {output_file}")
else:
    print("Error: No CSV file found in the FirestoreData folder.")


# Get the latest exported CSV file
csv_files = [f for f in os.listdir(folder_path) if f.endswith(".csv")]
csv_files.sort(reverse=True)  # Sort by newest first
latest_file = os.path.join(folder_path, csv_files[0]) if csv_files else None

if latest_file:
    # Load the CSV file
    df = pd.read_csv(latest_file)
    df.columns = df.columns.str.strip()  # Remove spaces from column names

    # Check if the required columns exist (case-sensitive match)
    required_columns = {"participant", "shownAtDate"}  # Fix the column name
    if not required_columns.issubset(set(df.columns)):
        print("Error: 'participant' or 'shownAtDate' column missing in CSV file.")
        print("Found columns:", df.columns)
        exit()

    # Extract unique combinations of participant and shownAtDate
    unique_combinations = df[["participant", "shownAtDate"]].drop_duplicates()

    # Output the results
    print("Unique Participant - ShownAtDate combinations:")
    print(unique_combinations)

    # Save to a new CSV file
    output_file = os.path.join(folder_path, "unique_participants_dates.csv")
    unique_combinations.to_csv(output_file, index=False)
    print(f"Unique combinations saved to {output_file}")
else:
    print("Error: No CSV file found in the FirestoreData folder.")