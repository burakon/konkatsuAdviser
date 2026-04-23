import pandas as pd

try:
    df = pd.read_excel('data.xlsx', header=9)
    df_nat = df[(df.iloc[:,1] == '00_全国') & (df.iloc[:,3] == '0_総数')]
    
    res = []
    for age in ['05_20～24歳', '06_25～29歳', '07_30～34歳', '08_35～39歳', '09_40～44歳', '10_45～49歳', '11_50～54歳', '12_55～59歳', '13_60～64歳']:
        tot_row = df_nat[(df_nat.iloc[:,5] == age) & (df_nat.iloc[:,4] == '0_総数')]
        bereaved_row = df_nat[(df_nat.iloc[:,5] == age) & (df_nat.iloc[:,4] == '31_死別')]
        
        if len(tot_row) > 0 and len(bereaved_row) > 0:
            tot_pop = pd.to_numeric(tot_row.iloc[0,6], errors='coerce')
            bereaved_pop = pd.to_numeric(bereaved_row.iloc[0,6], errors='coerce')
            rate = bereaved_pop / tot_pop if pd.notna(tot_pop) and tot_pop > 0 else 0
            res.append((age, tot_pop, bereaved_pop, rate))
        else:
            print(f"Missing data for {age}")

    for r in res:
        print(f"{r[0]}: {r[3]:.6f}")

except Exception as e:
    print(e)
