import pandas as pd
import sys

try:
    df = pd.read_excel('data.xlsx', header=None, nrows=100)
    with open('out.txt', 'w') as f:
        f.write("Columns: " + str(df.shape[1]) + "\n")
        for i in range(50):
            row = [str(x)[:20] for x in df.iloc[i].values if pd.notna(x)]
            if row:
                f.write(f"Row {i}: {row}\n")
except Exception as e:
    with open('out.txt', 'w') as f:
        f.write(str(e))
