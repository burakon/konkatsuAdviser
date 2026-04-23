import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import io

# 日本語表示の設定（環境に合わせて適宜変更してください）
# matplotlib.rc('font', family='Arial Unicode MS') 

# データの読み込み
df = pd.read_csv('income_age_raw.csv', index_col=0)

# 不要な行（総数）と列（総数）を削除
df = df.drop('総数', axis=0)
df = df.drop('総数', axis=1)

# 数値をクリーンアップ（カンマを削除して整数に）
def clean_num(x):
    if isinstance(x, str):
        x = x.replace(',', '').replace('-', '0')
    return int(x)

for col in df.columns:
    df[col] = df[col].apply(clean_num)

# 年齢階級と代表値の設定
age_groups = df.columns.tolist()
age_midpoints = [17.5, 22.5, 27.5, 32.5, 37.5, 42.5, 47.5, 52.5, 57.5, 62.5, 67.5, 72.5, 77.5, 82.5, 87.5]

# 所得階級と代表値の設定（万円）
income_bins = df.index.tolist()
income_midpoints = [25, 75, 125, 175, 225, 275, 350, 450, 550, 650, 750, 850, 950, 1125, 1375, 1750]

# 1. 年齢階級ごとの平均年収の算出
# 2. 推定中央値の算出（補間）
# 4. 年収500万円以上の割合の算出

results = []

for age_idx, age_name in enumerate(age_groups):
    counts = df[age_name].values
    total_people = counts.sum()
    
    if total_people == 0:
        continue
    
    # 平均
    avg_income = np.sum(counts * income_midpoints) / total_people
    
    # 500万円以上割合
    idx_500 = income_bins.index('500～599万円')
    people_over_500 = np.sum(counts[idx_500:])
    ratio_over_500 = people_over_500 / total_people
    
    # 中央値の推定（階級補間）
    cum_counts = np.cumsum(counts)
    median_rank = total_people / 2
    
    median_val = 0
    for i, cum in enumerate(cum_counts):
        if cum >= median_rank:
            # この階級に中央値がある
            prev_cum = cum_counts[i-1] if i > 0 else 0
            bin_width = 100 # デフォルト
            if '～' in income_bins[i]:
                parts = income_bins[i].replace('万円', '').split('～')
                lo = int(parts[0])
                hi = int(parts[1])
                bin_width = hi - lo
                base = lo
            elif '未満' in income_bins[i]:
                base = 0
                bin_width = 50
            else: # 1500万円以上
                base = 1500
                bin_width = 500 # 仮
            
            median_val = base + (median_rank - prev_cum) / counts[i] * bin_width
            break
            
    results.append({
        '年齢階級': age_name,
        '平均年齢': age_midpoints[age_idx],
        '平均年収': round(avg_income, 1),
        '推定中央値': round(median_val, 1),
        '500万円以上割合': round(ratio_over_500 * 100, 1)
    })

res_df = pd.DataFrame(results)

# 3. 相関係数の算出
# 全データ（重み付き）で相関を計算
all_ages = []
all_incomes = []
for age_idx, age_name in enumerate(age_groups):
    counts = df[age_name].values
    for inc_idx, count in enumerate(counts):
        if count > 0:
            # サンプリングを簡略化するため、重み付きの平均で代用することもできるが、
            # ここでは厳密に相関を出すため各セルをデータ点として扱う
            all_ages.extend([age_midpoints[age_idx]] * (count // 1000)) # スケール調整
            all_incomes.extend([income_midpoints[inc_idx]] * (count // 1000))

correlation = np.corrcoef(all_ages, all_incomes)[0, 1]

# 出力
print("### 年齢階級別集計表")
print(res_df[['年齢階級', '平均年収', '推定中央値', '500万円以上割合']].to_markdown(index=False))
print(f"\n### 年齢と年収の相関係数 (Pearson): {correlation:.4f}")

# グラフ作成
plt.figure(figsize=(10, 6))
plt.scatter(res_df['平均年齢'], res_df['平均年収'], color='blue', label='平均年収')
plt.plot(res_df['平均年齢'], res_df['平均年収'], linestyle='--', alpha=0.5)
plt.title('Age vs Average Income (Reiwa 4 Employment Status Survey)')
plt.xlabel('Age (Midpoint)')
plt.ylabel('Annual Income (10k Yen)')
plt.grid(True, which='both', linestyle='--', alpha=0.5)
plt.legend()
plt.savefig('age_income_scatter.png')
print("\n散布図を 'age_income_scatter.png' に保存しました。")
